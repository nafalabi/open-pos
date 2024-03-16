package controller

import (
	"open-pos/model"
	"open-pos/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type LoginParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// @Summary	Login into the app
// @Tags		Auth
// @Accept		json
// @Produce	json
// @Param		body	body	LoginParams	true	"Login Params"
// @Router		/auth/login [post]
func AuthLogin(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		reqBody := LoginParams{}

		if err := utils.BindAndValidate(c, &reqBody); err != nil {
			return utils.SendError(c, err)
		}

		user := model.User{}
		err := dbClient.Where("email = ?", reqBody.Email).First(&user).Error
		if err != nil {
			return utils.SendError(c, err)
		}

		jwtUtils := utils.NewJwt()
		tokens, err := jwtUtils.CreateJwtToken(user)
		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, tokens)
	}
}
