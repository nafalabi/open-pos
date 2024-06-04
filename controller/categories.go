package controller

import (
	"open-pos/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	model "open-pos/model"
)

type CategoryPayload struct {
	Name string `json:"name" validate:"required" gorm:"uniqueIndex"`
}

func (payload CategoryPayload) Fill(product *model.Category) {
	product.Name = payload.Name
}

//	@Summary	Create a new category
//	@Security	ApiKeyAuth
//	@Tags		Categories
//	@Accept		json
//	@Produce	json
//	@Param		body	body	CategoryPayload	true	"Category Data"
//	@Router		/categories [post]
func CreateCategory(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		reqBody := CategoryPayload{}

		if err := utils.BindAndValidate(c, &reqBody); err != nil {
			return utils.SendError(c, err)
		}

		category := model.Category{}
		reqBody.Fill(&category)

		err := dbClient.Transaction(func(tx *gorm.DB) error {
			err := tx.Create(&category).Error
			if err != nil {
				return err
			}

			return nil
		})
		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, category)
	}
}

//	@Summary	list of categories
//	@Security	ApiKeyAuth
//	@Tags		Categories
//	@Accept		json
//	@Produce	json
//	@Param		page		query	string	false	"page"
//	@Param		pagesize	query	string	false	"page size"
//	@Param		q			query	string	false	"search query"
//	@Router		/categories [get]
func ListCategory(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		limit, offset, page, pageSize := utils.DefinePaginationParam(c)
		searchQuery := c.QueryParam("q")

		var categories []model.Category
		var totalRecords int64

		query := dbClient.Model(&model.Category{})
		if searchQuery != "" {
			query.Where("name LIKE ?", "%"+searchQuery+"%")
		}

		query.Count(&totalRecords)
		query.Limit(limit).Offset(offset).Find(&categories)

		return utils.SendSuccessPaginated(c, categories, page, pageSize, int(totalRecords))
	}
}

//	@Summary	find category by id
//	@Security	ApiKeyAuth
//	@Tags		Categories
//	@Accept		json
//	@Produce	json
//	@Param		id	path	string	true	"Category ID"
//	@Router		/categories/{id} [get]
func FindCategory(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		categoryId := c.Param("id")

		var category model.Category

		err := dbClient.Where("id = ? ", categoryId).First(&category).Error
		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, category)
	}
}

//	@Summary	update category
//	@Security	ApiKeyAuth
//	@Tags		Categories
//	@Accept		json
//	@Produce	json
//	@Param		id		path	string			true	"Category ID"
//	@Param		body	body	CategoryPayload	true	"Category Data"
//	@Router		/categories/{id} [patch]
func UpdateCategory(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		categoryId := c.Param("id")
		reqBody := CategoryPayload{}
		category := model.Category{}

		err := utils.BindAndValidate(c, &reqBody)
		if err != nil {
			return utils.SendError(c, err)
		}

		err = dbClient.Where("id = ? ", categoryId).First(&category).Error
		if err != nil {
			return utils.SendError(c, err)
		}

		err = dbClient.Transaction(func(tx *gorm.DB) error {
			reqBody.Fill(&category)
			return tx.Save(&category).Error
		})

		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, category)
	}
}

//	@Summary	delete category by id
//	@Security	ApiKeyAuth
//	@Tags		Categories
//	@Accept		json
//	@Produce	json
//	@Param		id	path	string	true	"Category ID"
//	@Router		/categories/{id} [delete]
func DeleteCategory(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		categoryId := c.Param("id")

		err := dbClient.Where("id = ? ", categoryId).Delete(&model.Category{}).Error
		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, map[string]interface{}{
			"id": categoryId,
		})
	}
}
