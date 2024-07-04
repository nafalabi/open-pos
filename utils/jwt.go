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

type AccessClaims struct {
	UserId    string         `json:"user_id"`
	Name      string         `json:"name"`
	UserLevel enum.UserLevel `json:"user_level"`
	jwt.RegisteredClaims
}

type RefreshClaims struct {
	UserId string `json:"user_id"`
	jwt.RegisteredClaims
}

type JwtUtils struct {
	AccessSecret  string
	RefreshSecret string
}

func NewJwt() *JwtUtils {
	jwt := &JwtUtils{}
	jwt.GetConfig()
	return jwt
}

func (j *JwtUtils) GetConfig() {
	accessSecret := os.Getenv("JWT_ACCESS_SECRET")
	refreshSecret := os.Getenv("JWT_REFRESH_SECRET")

	if accessSecret == "" || refreshSecret == "" {
		panic("jwt secrets has not been configured")
	}

	j.AccessSecret = accessSecret
	j.RefreshSecret = refreshSecret
}

func (j *JwtUtils) CreateJwtToken(user model.User) (
	jwtToken struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}, err error,
) {
	accessToken, err := j.CreateAccessToken(user)
	if err != nil {
		return jwtToken, err
	}

	refreshToken, err := j.CreateRefreshToken(user)
	if err != nil {
		return jwtToken, err
	}

	jwtToken.AccessToken = accessToken
	jwtToken.RefreshToken = refreshToken

	return jwtToken, nil
}

func (j *JwtUtils) CreateAccessToken(user model.User) (string, error) {
	var err error
	claims := &AccessClaims{
		UserId:    user.ID,
		Name:      user.Name,
		UserLevel: user.Level,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := j.AccessSecret

	accessToken, err := token.SignedString([]byte(secret))

	return accessToken, err
}

func (j *JwtUtils) CreateRefreshToken(user model.User) (string, error) {
	var err error
	claims := &RefreshClaims{
		UserId: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 48)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := j.RefreshSecret

	refreshToken, err := token.SignedString([]byte(secret))

	return refreshToken, err
}

func (j *JwtUtils) ParseToken(tokenStr string, tokenType string) (*jwt.Token, error) {
	var secret string
	var claims jwt.Claims

	switch tokenType {
	case "access":
		secret = j.AccessSecret
		claims = &AccessClaims{}
	case "refresh":
		secret = j.RefreshSecret
		claims = &RefreshClaims{}
	}

	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	return token, err
}

func (j *JwtUtils) VerifyToken(tokenStr string) bool {
	token, err := j.ParseToken(tokenStr, "access")
	if err != nil {
		return false
	}

	_, ok := token.Claims.(*AccessClaims)

	return ok
}

func (j *JwtUtils) SetupMiddleware() echo.MiddlewareFunc {
	config := echojwt.Config{
		NewClaimsFunc: func(e echo.Context) jwt.Claims {
			return new(AccessClaims)
		},
		SigningKey: []byte(j.AccessSecret),
	}
	return echojwt.WithConfig(config)
}

func GetUserClaims(c echo.Context) AccessClaims {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(*AccessClaims)
	return *claims
}
