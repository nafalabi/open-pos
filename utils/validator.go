package utils

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type echoValidator struct {
	validator *validator.Validate
}

func (cv *echoValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		// Optionally, you could return the error to give each route more control over the status code
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	return nil
}

type CustomValidation interface {
	CustomValidate() bool
}

func ValidateCustom(fl validator.FieldLevel) bool {
	value := fl.Field().Interface().(CustomValidation)
	return value.CustomValidate()
}

func SetupValidator(e *echo.Echo) {
	v := validator.New()
	v.RegisterValidation("custom", ValidateCustom)
	e.Validator = &echoValidator{validator: v}
}
