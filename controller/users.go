package controller

import (
	"open-pos/enum"
	"open-pos/model"
	"open-pos/utils"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserPayload struct {
	Name     string         `json:"name" validate:"required"`
	Email    string         `json:"email" validate:"email"`
	Phone    string         `json:"phone"`
	Level    enum.UserLevel `json:"level" validate:"custom"`
	Password string         `json:"password"`
}

func (payload UserPayload) Fill(user *model.User) error {
	hashedPwd, err := bcrypt.GenerateFromPassword([]byte(payload.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Name = payload.Name
	user.Email = payload.Email
	user.Phone = payload.Phone
	user.Level = payload.Level
	user.Password = string(hashedPwd)

	return nil
}

// @Summary	Register a new user
// @Security	ApiKeyAuth
// @Tags		Users
// @Accept		json
// @Produce	json
// @Param		body	body	UserPayload	true	"User Data"
// @Router		/users [post]
func Register(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var reqBody UserPayload

		if err := utils.BindAndValidate(c, &reqBody); err != nil {
			return utils.ApiError{
				Message: "Invalid payload",
			}
		}

		if reqBody.Level == enum.Admin {
			err := utils.ApiError{
				Message: "Can't register admin level user",
			}
			return err
		}

		if reqBody.Password == "" {
			err := utils.ApiError{
				Message: "Password is required",
			}
			return err
		}

		var user model.User

		err := reqBody.Fill(&user)
		if err != nil {
			return err
		}

		dbClient.Create(&user)

		return utils.SendSuccess(c, user)
	}
}

// @Summary	list of users
// @Security	ApiKeyAuth
// @Tags		Users
// @Accept		json
// @Produce	json
// @Param		page		query	string	false	"page"
// @Param		pagesize	query	string	false	"page size"
// @Router		/users [get]
func ListUsers(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		limit, offset, page, pageSize := utils.GetPaginationParams(c)

		var users []model.User
		var totalRecords int64

		dbClient.Offset(offset).Limit(limit).Find(&users)
		dbClient.Model(&model.User{}).Count(&totalRecords)

		return utils.SendSuccessPaginated(c, users, page, pageSize, int(totalRecords))
	}
}

// @Summary	find user by id
// @Security	ApiKeyAuth
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
			return err
		}

		return utils.SendSuccess(c, user)
	}
}

// @Summary	update user
// @Security	ApiKeyAuth
// @Tags		Users
// @Accept		json
// @Produce	json
// @Param		id		path	string		true	"User ID"
// @Param		body	body	UserPayload	true	"User Data"
// @Router		/users/{id} [patch]
func UpdateUser(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		userId := c.Param("id")
		reqBody := UserPayload{}
		user := model.User{}

		err := utils.BindAndValidate(c, &reqBody)
		if err != nil {
			return utils.ApiError{
				Message: "Invalid payload",
			}
		}

		err = dbClient.Where("id = ? ", userId).First(&user).Error
		if err != nil {
			return err
		}

		reqBody.Fill(&user)
		dbClient.Save(&user)

		return utils.SendSuccess(c, user)
	}
}

// @Summary	delete user by id
// @Security	ApiKeyAuth
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
			return err
		}

		return utils.SendSuccess(c, map[string]interface{}{
			"id": userId,
		})
	}
}
