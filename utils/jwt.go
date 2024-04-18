package utils

import (
	"open-pos/enum"
	"open-pos/model"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
)

type JwtToken struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type JwtClaims struct {
	UserId    string         `json:"user_id"`
	Name      string         `json:"name"`
	Email     string         `json:"email"`
	UserLevel enum.UserLevel `json:"user_level"`
	jwt.RegisteredClaims
}

type Jwt struct {
	AccessSecret  string
	RefreshSecret string
}

func NewJwt() *Jwt {
	jwt := &Jwt{}
	jwt.GetConfig()
	return jwt
}

func (this *Jwt) GetConfig() {
	accessSecret := os.Getenv("JWT_ACCESS_SECRET")
	refreshSecret := os.Getenv("JWT_REFRESH_SECRET")

	if accessSecret == "" || refreshSecret == "" {
		panic("jwt secrets has not been configured")
	}

	this.AccessSecret = accessSecret
	this.RefreshSecret = refreshSecret
}

func (this *Jwt) CreateJwtToken(user model.User) (JwtToken, error) {
	var jwtToken JwtToken

	accessToken, err := this.CreateAccessToken(user)
	if err != nil {
		return jwtToken, err
	}

	refreshToken, err := this.CreateRefreshToken(user)
	if err != nil {
		return jwtToken, err
	}

	jwtToken.AccessToken = accessToken
	jwtToken.RefreshToken = refreshToken

	return jwtToken, nil
}

func (this *Jwt) CreateAccessToken(user model.User) (string, error) {
	var err error
	claims := &JwtClaims{
		UserId:    user.ID,
		Name:      user.Name,
		Email:     user.Email,
		UserLevel: user.Level,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := this.AccessSecret

	accessToken, err := token.SignedString([]byte(secret))

	return accessToken, err
}

// TODO: implement refresh token
func (this *Jwt) CreateRefreshToken(user model.User) (string, error) {
	return " ", nil
}

func (this *Jwt) SetupMiddleware() echo.MiddlewareFunc {
	config := echojwt.Config{
		NewClaimsFunc: func(e echo.Context) jwt.Claims {
			return new(JwtClaims)
		},
		SigningKey: []byte(this.AccessSecret),
	}
	return echojwt.WithConfig(config)
}

func GetUserClaims(c echo.Context) JwtClaims {
  user := c.Get("user").(*jwt.Token)
  claims := user.Claims.(*JwtClaims)
  return *claims 
}
