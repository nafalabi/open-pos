package utils

import (
	"strconv"

	"github.com/labstack/echo/v4"
)

func BindAndValidate[T any](c echo.Context, reqBody *T) error {
	var err error

	if err = c.Bind(reqBody); err != nil {
		return err
	}

	if err = c.Validate(reqBody); err != nil {
		return err
	}

	return err
}

func DefinePaginationParam(c echo.Context) (
	limit int, offset int, page int, pageSize int,
) {
	page, _ = strconv.Atoi(c.QueryParam("page"))
	pageSize, _ = strconv.Atoi(c.QueryParam("pagesize"))

	if page < 1 {
		page = 1
	}
	if pageSize < 5 {
		pageSize = 5
	}
	if pageSize > 50 {
		pageSize = 50
	}

	offset = (page - 1) * pageSize
	limit = pageSize

	return limit, offset, page, pageSize
}
