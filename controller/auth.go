package controller

import (
	"open-pos/model"
	"open-pos/utils"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
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
			return utils.SendError(c, utils.ConstructError("Invalid credentials"))
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(reqBody.Password)); err != nil {
			return utils.SendError(c, utils.ConstructError("Invalid credentials"))
		}

		jwtUtils := utils.NewJwt()
		tokens, err := jwtUtils.CreateJwtToken(user)
		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, tokens)
	}
}

// @Summary	Get user logged info
// @Security ApiKeyAuth
// @Tags		Auth
// @Accept		json
// @Produce	json
// @Router		/auth/userinfo [get]
func UserInfo(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		userClaims := utils.GetUserClaims(c)

		user := model.User{}
		err := dbClient.Where("id = ?", userClaims.UserId).First(&user).Error
		if err != nil {
			return utils.SendError(c, err)
		}

		return utils.SendSuccess(c, user)
	}
}
