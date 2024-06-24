package utils

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func TranslateGormError(error error) (int, string) {
	var httpCode int
	var errorMessage string

	if error != nil {
		switch error {
		case gorm.ErrRecordNotFound:
			httpCode = http.StatusNotFound
			errorMessage = "Data not found"
		default:
			httpCode = http.StatusInternalServerError
			errorMessage = "Internal server error"
		}
	}
	return httpCode, errorMessage
}

type ApiError struct {
	Code    int
	Message string
}

func (e ApiError) Error() string {
	return e.Message
}

func SetupErrorHandler(e *echo.Echo) {
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		if apiErr, ok := err.(ApiError); ok {
			var code int
			message := apiErr.Message
			if apiErr.Code == 0 {
				code = http.StatusBadRequest
			}
			e := SendError(c, code, message)
			if e != nil {
				panic(e)
			}
			return
		}
		code, message := TranslateGormError(err)
		e := SendError(c, code, message)
		if e != nil {
			panic(e)
		}
	}
}
