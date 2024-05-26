package controller

import (
	"open-pos/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	model "open-pos/model"
)

// @Summary	Create a new product
// @Security	ApiKeyAuth
// @Tags		Products
// @Accept		json
// @Produce	json
// @Param		body	body	model.ProductFillable	true	"Product Data"
// @Router		/products [post]
func CreateProduct(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		reqBody := model.ProductFillable{}

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
// @Router		/products [get]
func ListProduct(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		limit, offset, page, pageSize := utils.DefinePaginationParam(c)
		searchQuery := c.QueryParam("q")

		var products []model.Product
		var totalRecords int64

		query := dbClient.Model(&model.Product{}).Offset(offset).Limit(limit).Preload("Categories")

		if searchQuery != "" {
			query.Where("name like ?", "%"+searchQuery+"%")
		}

		query.Find(&products)
		dbClient.Model(&model.Product{}).Count(&totalRecords)

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
// @Param		id		path	string					true	"Product ID"
// @Param		body	body	model.ProductFillable	true	"Product Data"
// @Router		/products/{id} [patch]
func UpdateProduct(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		productId := c.Param("id")
		reqBody := model.ProductFillable{}
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
