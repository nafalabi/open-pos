package utils

import (
	"net/http"

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
      errorMessage = error.Error()
			// errorMessage = "Unknown error"
		}
	}
	return httpCode, errorMessage
}

type CustomError struct{
  ErrorMessage string
}

func (this *CustomError) Error() string {
  return this.ErrorMessage
}

func ConstructError(message string) error {
  return &CustomError{ErrorMessage: message}
}

