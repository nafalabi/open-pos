package controller

import (
	"open-pos/model"
	"open-pos/utils"

	"github.com/labstack/echo/v4"
	"github.com/samber/lo"
	"gorm.io/gorm"
)

type OrderPayload struct {
	Items         []OrderItemPayload  `json:"items" validate:"dive"`
	PaymentMethod model.PaymentMethod `json:"payment_method" validate:"custom"`
	Remarks       string              `json:"remarks"`
}
type OrderItemPayload struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity" validate:"required,min=1"`
}

func (payload *OrderPayload) GetItems(db *gorm.DB) []model.OrderItem {
	var items []model.OrderItem
	if (payload == nil) || (payload.Items == nil) || len(payload.Items) < 1 {
		return items
	}

	var productIds []string
	var itemMap = make(map[string]OrderItemPayload)
	for _, item := range payload.Items {
		var productId string = item.ProductID
		productIds = append(productIds, productId)
		itemMap[productId] = item
	}

	var products []model.Product
	db.Model(&model.Product{}).Where("id in ?", productIds).Find(&products)

	for _, product := range products {
		item := itemMap[product.ID]
		items = append(items, model.OrderItem{
			Product:   &product,
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
// @Param		body	body OrderPayload	true	"Order Data"
// @Router		/orders [post]
func CreateOrder(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		reqBody := OrderPayload{}
		order := model.Order{}
		if err := utils.BindAndValidate(c, &reqBody); err != nil {
			return utils.SendError(c, err)
		}

		err := dbClient.Transaction(func(tx *gorm.DB) error {
			items := reqBody.GetItems(tx)
			order.Items = items
			order.PaymentMethod = reqBody.PaymentMethod
			order.Status = model.StatusPending
			order.Total = lo.Reduce(items, func(acc float64, item model.OrderItem, _ int) float64 {
				return acc + item.SubTotal
			}, 0)

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

// @Summary list of orders
// @Security	ApiKeyAuth
// @Tags		Orders
// @Accept		json
// @Produce	json
// @Param		page		query	string	false	"page"
// @Param		pagesize	query	string	false	"page size"
// @Param		q			query	string	false	"search query"
// @Router		/orders [get]
func ListOrder(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		limit, offset, page, pageSize := utils.DefinePaginationParam(c)
		searchQuery := c.QueryParam("q")

		var orders []model.Order
		var totalRecords int64

		query := dbClient.Model(&model.Order{})

		if searchQuery != "" {
			query.Where("order_number like ?", "%"+searchQuery+"%")
			query.Or("recipient like ?", "%"+searchQuery+"%")
		}

		query.Count(&totalRecords)
		query.Offset(offset).Limit(limit).Preload("Items").Find(&orders)

		return utils.SendSuccessPaginated(c, orders, page, pageSize, int(totalRecords))
	}
}
