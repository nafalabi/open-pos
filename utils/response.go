package utils

import (
	"math"
	"net/http"

	"github.com/labstack/echo/v4"
)

// type response_util struct {
// 	HTTPError            response_error
// 	HTTPSuccess          response_success
// 	HTTPSuccessPaginated response_success_paginated
// 	Pagination           pagination
// }
//
// var Response response_util

func SendSuccess(context echo.Context, data interface{}) error {
	return context.JSON(http.StatusOK, Response_success{
		Code: 200,
		Data: data,
	})
}

func SendSuccessPaginated(
	context echo.Context, data interface{}, page int, pageSize int, totalRecords int,
) error {
	response := Response_success_paginated{
		Code: 200,
		Data: data,
		Pagination: Pagination{
			CurrentPage:  page,
			PageSize:     pageSize,
			TotalRecords: int(totalRecords),
			TotalPage:    int(math.Ceil(float64(totalRecords) / float64(pageSize))),
		},
	}
	return context.JSON(http.StatusOK, response)
}

func SendErrorPlain(context echo.Context, httpCode int, message string) error {
	return context.JSON(httpCode, Response_error{
		Code:    httpCode,
		Message: message,
	})
}

func SendError(context echo.Context, error error) error {
	httpCode, message := TranslateGormError(error)
	return SendErrorPlain(context, httpCode, message)
}

type Response_error struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"status bad request"`
}

type Response_success struct {
	Code int         `json:"code" example:"200"`
	Data interface{} `json:"data"`
}

type Response_success_paginated struct {
	Code       int        `json:"code" example:"200"`
	Data       any        `json:"data"`
	Pagination Pagination `json:"pagination"`
}

type Pagination struct {
	CurrentPage  int `json:"current_page"`
	PageSize     int `json:"page_size"`
	TotalRecords int `json:"total_items"`
	TotalPage    int `json:"total_page"`
}
