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
		dbClient.Create(&product)

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
// @Router		/products [get]
func ListProduct(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		limit, offset, page, pageSize := utils.DefinePaginationParam(c)

		var products []model.Product
		var totalRecords int64

		dbClient.Offset(offset).Limit(limit).Find(&products)
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

		err := dbClient.Where("id = ? ", productId).First(&product).Error
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

		reqBody.Fill(&product)
		dbClient.Save(&product)

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
