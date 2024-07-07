package controller

import (
	"net/http"
	"open-pos/internal/enum"
	"open-pos/internal/model"
	"open-pos/internal/service/payment-gateway"
	"open-pos/internal/utils"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/samber/lo"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type OrderPayload struct {
	Items         []OrderItemPayload `json:"items" validate:"gt=0,dive,required"`
	PaymentMethod string             `json:"payment_method"`
	Remarks       string             `json:"remarks"`
	Recipient     string             `json:"recipient"`
}
type OrderItemPayload struct {
	ProductID string `json:"product_id" validate:"required"`
	Quantity  int    `json:"quantity" validate:"required,min=1"`
}
type PayOrderCashPayload struct {
	InputAmount float64 `json:"input_amount" validate:"required"`
	TipAmount   float64 `json:"tip_amount"`
	Notes       string  `json:"notes"`
}

func (payload *OrderPayload) GetItems(db *gorm.DB) []model.OrderItem {
	var items []model.OrderItem
	if (payload == nil) || (payload.Items == nil) || len(payload.Items) < 1 {
		return items
	}

	var productIds []string
	itemMap := make(map[string]OrderItemPayload)

	for _, item := range payload.Items {
		var productId string = item.ProductID
		productIds = append(productIds, productId)
		itemMap[productId] = item
	}

	var products []model.Product
	db.Model(&model.Product{}).Where("id in ?", productIds).Find(&products)

	for _, product := range products {
		item := itemMap[product.ID]
		productId := product.ID
		items = append(items, model.OrderItem{
			ProductID: &productId,
			Quantity:  item.Quantity,
			PriceEach: product.Price,
			SubTotal:  product.Price * float64(item.Quantity),
		})
	}

	return items
}

// @Summary	Create a new order
// @Security	ApiKeyAuth
// @Tags		Orders
// @Accept		json
// @Produce	json
// @Param		body	body	OrderPayload	true	"Order Data"
// @Router		/orders [post]
func CreateOrder(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		reqBody := OrderPayload{}
		order := model.Order{}

		if err := utils.BindAndValidate(c, &reqBody); err != nil {
			return utils.ApiError{
				Message: "Invalid payload",
			}
		}

		err := dbClient.Transaction(func(tx *gorm.DB) error {
			paymentMethod, err := FindMethod(reqBody.PaymentMethod)
			if err != nil {
				return err
			}

			items := reqBody.GetItems(tx)
			subtotal := lo.Reduce(items, func(acc float64, item model.OrderItem, _ int) float64 {
				return acc + item.SubTotal
			}, 0)
			paymentFee := CalculatePaymentFee(paymentMethod, subtotal)

			order.Recipient = reqBody.Recipient
			order.Remarks = reqBody.Remarks
			order.Items = items
			order.PaymentMethod = reqBody.PaymentMethod
			order.Status = enum.StatusPending
			order.PaymentFee = paymentFee
			order.SubTotal = subtotal
			order.Total = order.SubTotal + order.PaymentFee

			err = tx.Create(&order).Error
			if err != nil {
				return utils.ApiError{
					Code:    http.StatusUnprocessableEntity,
					Message: "Failed to create order",
				}
			}

			if order.PaymentMethod == "cash" {
				return nil
			}

			paygate, err := payment_gateway.NewPaymentGateway(order.PaymentMethod, tx)
			if err != nil {
				return utils.ApiError{
					Code:    http.StatusUnprocessableEntity,
					Message: "Failed to setup payment gateway",
				}
			}

			err = paygate.ChargeTransaction(&order, nil)
			if err != nil {
				return utils.ApiError{
					Code:    http.StatusUnprocessableEntity,
					Message: "Failed to charge Order",
				}
			}

			return nil
		})
		if err != nil {
			return err
		}

		return utils.SendSuccess(c, order)
	}
}

// @Summary	list of orders
// @Security	ApiKeyAuth
// @Tags		Orders
// @Accept		json
// @Produce	json
// @Param		page		query	string	false	"page"
// @Param		pagesize	query	string	false	"page size"
// @Param		q			query	string	false	"search query"
// @Param		date		query	string	false	"date search (YYYY-MM-DD)"
// @Param		sortkey		query	string	false	"sort key"
// @Param		sortdir		query	string	false	"sort direction (asc/desc)"
// @Router		/orders [get]
func ListOrder(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		limit, offset, page, pageSize := utils.GetPaginationParams(c)
		isSorted, sortKey, sortDirection := utils.GetSortParams(c)
		searchQuery := c.QueryParam("q")
		dateText := c.QueryParam("date")

		var orders []model.Order
		var totalRecords int64

		query := dbClient.Model(&model.Order{})

		if isSorted {
			query = query.Order(clause.OrderByColumn{
				Column: clause.Column{Name: sortKey},
				Desc:   sortDirection == utils.DESC,
			})
		}

		if searchQuery != "" {
			query.Where("order_number like ?", "%"+searchQuery+"%")
			query.Or("recipient like ?", "%"+searchQuery+"%")
		}

		if dateText != "" {
			selectedDate, error := time.Parse("2006-01-02", dateText)
			if error != nil {
				return utils.ApiError{
					Message: "invalid date filter",
				}
			}
			startOfDay := selectedDate.Round(time.Hour * 24)
			endOfDay := startOfDay.Add(time.Hour * 24)
			query.Where("created_at BETWEEN ? AND ?", startOfDay, endOfDay)
		}

		query.Count(&totalRecords)
		query.Offset(offset).Limit(limit).Preload("Items").Find(&orders)

		return utils.SendSuccessPaginated(c, orders, page, pageSize, int(totalRecords))
	}
}

// @Summary	find order by id
// @Security	ApiKeyAuth
// @Tags		Orders
// @Accept		json
// @Produce	json
// @Param		id				path	string	true	"order id"
// @Param		includeProducts	query	bool	false	"Should include products"
// @Router		/orders/{id} [get]
func FindOrder(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		includeProducts := c.QueryParam("includeProducts")
		var order model.Order

		query := dbClient.Model(model.Order{})
		query.Where("id = ?", id).Preload("Items")

		if includeProducts != "" {
			query.Preload("Items.Product")
		}

		query.First(&order)

		err := query.Error
		if err != nil {
			return err
		}

		return utils.SendSuccess(c, order)
	}
}

// @Summary	Pay order (cash)
// @Security	ApiKeyAuth
// @Tags		Orders
// @Accept		json
// @Produce	json
// @Param		id		path	string				true	"order id"
// @Param		body	body	PayOrderCashPayload	true	"payload"
// @Router		/orders/{id}/cashpay [post]
func CashpayOrder(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		var order model.Order
		var payload PayOrderCashPayload

		if err := utils.BindAndValidate(c, &payload); err != nil {
			return utils.ApiError{
				Message: "Invalid payload",
			}
		}

		err := dbClient.Where("id = ?", id).First(&order).Error
		if err != nil {
			return err
		}

		err = dbClient.Transaction(func(tx *gorm.DB) error {
			paymentMethod := order.PaymentMethod

			if paymentMethod != "cash" {
				return utils.ApiError{
					Message: "The payment method used is not supported",
				}
			}

			if order.Status != enum.StatusPending {
				return utils.ApiError{
					Message: "The order is already paid / canceled",
				}
			}

			if (payload.InputAmount - payload.TipAmount) < order.Total {
				return utils.ApiError{
					Message: "Payment amount was not met",
				}
			}

			changeAmount := payload.InputAmount - payload.TipAmount - order.Total

			transaction := model.Transaction{
				Type:         enum.TransactionPay,
				ExpectAmount: order.Total,
				InputAmount:  payload.InputAmount,
				TipAmount:    payload.TipAmount,
				ChangeAmount: changeAmount,
				OrderID:      order.ID,
				Notes:        payload.Notes,
			}

			tx.Model(model.Transaction{}).Save(&transaction)

			order.Status = enum.StatusPaid
			tx.Save(&order)

			return nil
		})

		if err != nil {
			return err
		}

		return utils.SendSuccess(c, order)
	}
}

// @Summary	Mark order as completed
// @Security	ApiKeyAuth
// @Tags		Orders
// @Accept		json
// @Produce	json
// @Param		id	path	string	true	"order id"
// @Router		/orders/{id}/complete [post]
func CompleteOrder(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		var order model.Order

		err := dbClient.Where("id = ?", id).First(&order).Error
		if err != nil {
			return err
		}

		if order.Status != enum.StatusPaid {
			return utils.ApiError{
				Message: "Unable to complete the order, the order was not paid.",
			}
		}

		order.Status = enum.StatusCompleted

		dbClient.Save(&order)

		return utils.SendSuccess(c, order)
	}
}

// @Summary	Cancel order
// @Security	ApiKeyAuth
// @Tags		Orders
// @Accept		json
// @Produce	json
// @Param		id	path	string	true	"order id"
// @Router		/orders/{id}/cancel [post]
func CancelOrder(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		var order model.Order
		err := dbClient.Where("id = ?", id).First(&order).Error
		if err != nil {
			return err
		}
		if order.Status != enum.StatusPending {
			return utils.ApiError{
				Message: "Unable to cancel the order, can only cancel pending orders.",
			}
		}
		order.Status = enum.StatusCanceled
		dbClient.Save(&order)
		return utils.SendSuccess(c, order)
	}
}

// @Summary	Get Payment Info
// @Security	ApiKeyAuth
// @Tags		Orders
// @Accept		json
// @Produce	json
// @Param		id	path	string	true	"order id"
// @Router		/orders/{id}/payment-info [get]
func GetPaymentInfo(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		var paymentInfo model.PaymentInfo

		err := dbClient.Where("order_id = ?", id).First(&paymentInfo).Error
		if err != nil {
			return utils.ApiError{
				Code:    http.StatusNotFound,
				Message: "Unable to find payment info",
			}
		}

		return utils.SendSuccess(c, paymentInfo)
	}
}

// @Summary	Refresh Order Status
// @Security	ApiKeyAuth
// @Tags		Orders
// @Accept		json
// @Produce	json
// @Param		id	path	string	true	"order id"
// @Router		/orders/{id}/refresh-status [post]
func RefreshOrderStatus(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		var order model.Order

		err := dbClient.Where("id = ?", id).First(&order).Error
		if err != nil {
			return utils.ApiError{
				Code:    http.StatusNotFound,
				Message: "Unable to find order",
			}
		}

		err = dbClient.Transaction(func(tx *gorm.DB) error {
			paygate, err := payment_gateway.NewPaymentGateway(order.PaymentMethod, tx)
			if err != nil {
				return utils.ApiError{
					Code:    http.StatusUnprocessableEntity,
					Message: err.Error(),
				}
			}

			err = paygate.StatusTransaction(&order, nil)
			if err != nil {
				return utils.ApiError{
					Code:    http.StatusUnprocessableEntity,
					Message: "an error occured: " + err.Error(),
				}
			}

			return nil
		})

		if err != nil {
			return err
		}

		return utils.SendSuccess(c, order)
	}
}
