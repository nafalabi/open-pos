package controller

import (
	"open-pos/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	model "open-pos/model"
)

type ProductPayload struct {
	Name        string  `json:"name" validate:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" validate:"min=0"`
	Image       string  `json:"image" validate:"omitempty"`
	// Image       string   `json:"image" validate:"omitempty,uri"` // ts types converter cant support uri for now
	Stock      int64    `json:"stock" validate:"min=0"`
	Categories []string `json:"categories" gorm:"-"`
}

func (payload ProductPayload) Fill(product *model.Product) {
	product.Name = payload.Name
	product.Description = payload.Description
	product.Price = payload.Price
	product.Image = payload.Image
	product.Stock = payload.Stock
}

// @Summary	Create a new product
// @Security	ApiKeyAuth
// @Tags		Products
// @Accept		json
// @Produce	json
// @Param		body	body	ProductPayload	true	"Product Data"
// @Router		/products [post]
func CreateProduct(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		reqBody := ProductPayload{}

		if err := utils.BindAndValidate(c, &reqBody); err != nil {
			return utils.SendError(c, err)
		}

		product := model.Product{}
		reqBody.Fill(&product)

		err := dbClient.Transaction(func(tx *gorm.DB) error {
			var err error

			categoryIDs := reqBody.Categories
			var categories []model.Category

			if len(categoryIDs) > 0 {
				err = tx.Where("ID in ?", categoryIDs).Find(&categories).Error
				if err != nil {
					return err
				}
			}

			product.Categories = categories

			err = tx.Create(&product).Error
			if err != nil {
				return err
			}

			return nil
		})
		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, product)
	}
}

// @Summary	list of products
// @Security	ApiKeyAuth
// @Tags		Products
// @Accept		json
// @Produce	json
// @Param		page		query	string	false	"page"
// @Param		pagesize	query	string	false	"page size"
// @Param		q			query	string	false	"search query"
// @Param		category	query	string	false	"category id"
// @Router		/products [get]
func ListProduct(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		limit, offset, page, pageSize := utils.DefinePaginationParam(c)
		searchQuery := c.QueryParam("q")
		categoryId := c.QueryParam("category")

		var products []model.Product
		var totalRecords int64

		query := dbClient.Model(&model.Product{}).Preload("Categories")

		if searchQuery != "" {
			query.Where("name like ?", "%"+searchQuery+"%")
		}

		if categoryId != "" {
			query.Joins("JOIN product_categories ON product_categories.product_id = products.id").Where("product_categories.category_id = ?", categoryId)
		}

		query.Count(&totalRecords)
		query.Offset(offset).Limit(limit).Find(&products)

		return utils.SendSuccessPaginated(c, products, page, pageSize, int(totalRecords))
	}
}

// @Summary	find product by id
// @Security	ApiKeyAuth
// @Tags		Products
// @Accept		json
// @Produce	json
// @Param		id	path	string	true	"Product ID"
// @Router		/products/{id} [get]
func FindProduct(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		productId := c.Param("id")

		var product model.Product

		err := dbClient.Where("id = ? ", productId).Preload("Categories").First(&product).Error
		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, product)
	}
}

// @Summary	update product
// @Security	ApiKeyAuth
// @Tags		Products
// @Accept		json
// @Produce	json
// @Param		id		path	string			true	"Product ID"
// @Param		body	body	ProductPayload	true	"Product Data"
// @Router		/products/{id} [patch]
func UpdateProduct(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		productId := c.Param("id")
		reqBody := ProductPayload{}
		product := model.Product{}

		err := utils.BindAndValidate(c, &reqBody)
		if err != nil {
			return utils.SendError(c, err)
		}

		err = dbClient.Where("id = ? ", productId).First(&product).Error
		if err != nil {
			return utils.SendError(c, err)
		}

		err = dbClient.Transaction(func(tx *gorm.DB) error {
			var err error

			reqBody.Fill(&product)
			tx.Save(&product)

			categoryIDs := reqBody.Categories
			if len(categoryIDs) < 1 {
				return nil
			}

			var categories []model.Category
			err = tx.Where("ID in ?", categoryIDs).Find(&categories).Error
			if err != nil {
				return err
			}

			err = tx.Model(&product).Association("Categories").Replace(categories)
			if err != nil {
				return err
			}

			return nil
		})

		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, product)
	}
}

// @Summary	delete product by id
// @Security	ApiKeyAuth
// @Tags		Products
// @Accept		json
// @Produce	json
// @Param		id	path	string	true	"Product ID"
// @Router		/products/{id} [delete]
func DeleteProduct(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		productId := c.Param("id")

		err := dbClient.Where("id = ? ", productId).Delete(&model.Product{}).Error
		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, map[string]interface{}{
			"id": productId,
		})
	}
}
