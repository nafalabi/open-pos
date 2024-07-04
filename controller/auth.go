package controller

import (
	"net/http"
	"open-pos/model"
	"open-pos/utils"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type LoginParams struct {
	Email    string `json:"email" example:"admin@admin.com"`
	Password string `json:"password" example:"admin"`
}

type RefreshParams struct {
	RefreshToken string `json:"refresh_token"`
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
			return utils.ApiError{
				Message: "Invalid payload",
			}
		}

		user := model.User{}
		err := dbClient.Where("email = ?", reqBody.Email).First(&user).Error
		if err != nil {
			return utils.ApiError{
				Message: "Invalid credentials",
			}
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(reqBody.Password)); err != nil {
			return utils.ApiError{
				Message: "Invalid credentials",
			}
		}

		jwtUtils := utils.NewJwt()
		tokens, err := jwtUtils.CreateJwtToken(user)
		if err != nil {
			return utils.ApiError{
				Message: "Failed to process login",
			}
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
			return err
		}

		return utils.SendSuccess(c, user)
	}
}

// @Summary	Refresh Token
// @Tags		Auth
// @Accept		json
// @Produce	json
// @Param		body	body	RefreshParams	true	"Refresh Params"
// @Router		/auth/refresh [post]
func RefreshToken(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var reqBody RefreshParams

		if err := utils.BindAndValidate(c, &reqBody); err != nil {
			return utils.ApiError{
				Message: "Invalid payload",
			}
		}

		jwtUtils := utils.NewJwt()
		token, err := jwtUtils.ParseToken(reqBody.RefreshToken, "refresh")
		if err != nil {
			return utils.ApiError{
				Code:    http.StatusUnprocessableEntity,
				Message: "Refresh token is not valid.",
			}
		}

		claims, ok := token.Claims.(*utils.RefreshClaims)
		if !ok {
			return utils.ApiError{
				Code:    http.StatusUnprocessableEntity,
				Message: "Refresh token is not valid",
			}
		}

		user := model.User{}
		err = dbClient.Where("id = ?", claims.UserId).First(&user).Error
		if err != nil {
			return utils.ApiError{
				Message: "User not found",
			}
		}

		jwtToken, err := jwtUtils.CreateJwtToken(user)
		if err != nil {
			return utils.ApiError{
				Message: "Failed to create token",
			}
		}

		return utils.SendSuccess(c, jwtToken)
	}
}
