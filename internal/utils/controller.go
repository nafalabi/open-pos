package utils

import (
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type ControllerHandler = func(*gorm.DB) echo.HandlerFunc

func RegisterController(
	client *gorm.DB,
	handler ControllerHandler,
) echo.HandlerFunc {
	return handler(client)
}
