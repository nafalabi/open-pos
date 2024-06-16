package controller

import (
	"open-pos/enum"
	"open-pos/model"
	"open-pos/utils"

	"github.com/labstack/echo/v4"
	"github.com/samber/lo"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type OrderPayload struct {
	Items         []OrderItemPayload `json:"items" validate:"gt=0,dive,required"`
	PaymentMethod enum.PaymentMethod `json:"payment_method" validate:"custom"`
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

func (payload *OrderPayload) GetPaymentFee(subTotal float64) float64 {
	method := payload.PaymentMethod
	switch method {
	case enum.PaymentMethodCash:
		return 0
	case enum.PaymentMethodTransfer:
		return 4000
	case enum.PaymentMethodQris:
		return subTotal * (0.7 / 100)
	default:
		return 0
	}
}

//	@Summary	Create a new order
//	@Security	ApiKeyAuth
//	@Tags		Orders
//	@Accept		json
//	@Produce	json
//	@Param		body	body	OrderPayload	true	"Order Data"
//	@Router		/orders [post]
func CreateOrder(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		reqBody := OrderPayload{}
		order := model.Order{}

		if err := utils.BindAndValidate(c, &reqBody); err != nil {
			return utils.SendError(c, err)
		}

		err := dbClient.Transaction(func(tx *gorm.DB) error {
			items := reqBody.GetItems(tx)

			order.Recipient = reqBody.Recipient
			order.Remarks = reqBody.Remarks
			order.Items = items
			order.PaymentMethod = reqBody.PaymentMethod
			order.Status = enum.StatusPending
			order.SubTotal = lo.Reduce(items, func(acc float64, item model.OrderItem, _ int) float64 {
				return acc + item.SubTotal
			}, 0)
			order.PaymentFee = reqBody.GetPaymentFee(order.SubTotal)
			order.Total = order.SubTotal + order.PaymentFee

			err := tx.Create(&order).Error
			if err != nil {
				return err
			}
			return nil
		})
		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, order)
	}
}

//	@Summary	list of orders
//	@Security	ApiKeyAuth
//	@Tags		Orders
//	@Accept		json
//	@Produce	json
//	@Param		page		query	string	false	"page"
//	@Param		pagesize	query	string	false	"page size"
//	@Param		q			query	string	false	"search query"
//	@Param		sortkey		query	string	false	"sort key"
//	@Param		sortdir		query	string	false	"sort direction (asc/desc)"
//	@Router		/orders [get]
func ListOrder(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		limit, offset, page, pageSize := utils.GetPaginationParams(c)
		isSorted, sortKey, sortDirection := utils.GetSortParams(c)
		searchQuery := c.QueryParam("q")

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

		query.Count(&totalRecords)
		query.Offset(offset).Limit(limit).Preload("Items").Find(&orders)

		return utils.SendSuccessPaginated(c, orders, page, pageSize, int(totalRecords))
	}
}

//	@Summary	find order by id
//	@Security	ApiKeyAuth
//	@Tags		Orders
//	@Accept		json
//	@Produce	json
//	@Param		id				path	string	true	"order id"
//	@Param		includeProducts	query	bool	false	"Should include products"
//	@Router		/orders/{id} [get]
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
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, order)
	}
}

//	@summary	Pay order (cash)
//	@Security	ApiKeyAuth
//	@Tags		Orders
//	@Accept		json
//	@Produce	json
//	@Param		id		path	string				true	"order id"
//	@Param		body	body	PayOrderCashPayload	true	"payload"
//	@Router		/orders/{id}/cashpay [post]
func Cashpay(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		var order model.Order
		var payload PayOrderCashPayload

		if err := utils.BindAndValidate(c, &payload); err != nil {
			return utils.SendError(c, err)
		}

		err := dbClient.Where("id = ?", id).First(&order).Error
		if err != nil {
			return utils.SendError(c, err)
		}

		err = dbClient.Transaction(func(tx *gorm.DB) error {
			paymentMethod := enum.PaymentMethod(order.PaymentMethod)

			if paymentMethod != enum.PaymentMethodCash {
				return utils.ConstructError("Sorry the method you choose is currently underdevelopment")
			}

			if order.Status == enum.StatusPaid {
				return utils.ConstructError("The order is already paid")
			}

			if (payload.InputAmount - payload.TipAmount) < order.Total {
				return utils.ConstructError("Payment amount was not met")
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
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, order)
	}
}
