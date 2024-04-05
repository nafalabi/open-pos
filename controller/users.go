package controller

import (
	"open-pos/enum"
	"open-pos/model"
	"open-pos/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// @Summary	Register a new user
// @Security ApiKeyAuth
// @Tags		Users
// @Accept		json
// @Produce	json
// @Param		body	body	model.UserFillable	true	"User Data"
// @Router		/users [post]
func Register(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var reqBody model.UserFillable

		if err := utils.BindAndValidate(c, &reqBody); err != nil {
			return utils.SendError(c, err)
		}

		if reqBody.Level == enum.Admin {
			err := utils.ConstructError("Can't register admin level user")
			return utils.SendError(c, err)
		}

		if reqBody.Password == "" {
			err := utils.ConstructError("Password is required")
			return utils.SendError(c, err)
		}

		var user model.User

    err := reqBody.Fill(&user)
    if err != nil {
      return utils.SendError(c, err)
    }

		dbClient.Create(&user)

		return utils.SendSuccess(c, user)
	}
}

// @Summary	list of users
// @Security ApiKeyAuth
// @Tags		Users
// @Accept		json
// @Produce	json
// @Param		page		query	string	false	"page"
// @Param		pagesize	query	string	false	"page size"
// @Router		/users [get]
func ListUsers(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		limit, offset, page, pageSize := utils.DefinePaginationParam(c)

		var users []model.User
		var totalRecords int64

		dbClient.Offset(offset).Limit(limit).Find(&users)
		dbClient.Model(&model.User{}).Count(&totalRecords)

		return utils.SendSuccessPaginated(c, users, page, pageSize, int(totalRecords))
	}
}

// @Summary	find user by id
// @Security ApiKeyAuth
// @Tags		Users
// @Accept		json
// @Produce	json
// @Param		id	path	string	true	"User ID"
// @Router		/users/{id} [get]
func FindUser(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		userId := c.Param("id")

		var user model.User

		err := dbClient.Where("id = ? ", userId).First(&user).Error
		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, user)
	}
}

// @Summary	update user
// @Security ApiKeyAuth
// @Tags		Users
// @Accept		json
// @Produce	json
// @Param		id		path	string				true	"User ID"
// @Param		body	body	model.UserFillable	true	"User Data"
// @Router		/users/{id} [patch]
func UpdateUser(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		userId := c.Param("id")
		reqBody := model.UserFillable{}
		user := model.User{}

		err := utils.BindAndValidate(c, &reqBody)
		if err != nil {
			return utils.SendError(c, err)
		}

		err = dbClient.Where("id = ? ", userId).First(&user).Error
		if err != nil {
			return utils.SendError(c, err)
		}

		reqBody.Fill(&user)
		dbClient.Save(&user)

		return utils.SendSuccess(c, user)
	}
}

// @Summary	delete user by id
// @Security ApiKeyAuth
// @Tags		Users
// @Accept		json
// @Produce	json
// @Param		id	path	string	true	"User ID"
// @Router		/users/{id} [delete]
func DeleteUser(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		userId := c.Param("id")

		err := dbClient.Where("id = ? ", userId).Delete(&model.User{}).Error
		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, map[string]interface{}{
			"id": userId,
		})
	}
}
