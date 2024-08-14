package report_controller

import (
	"open-pos/internal/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type ReportParams struct {
	Entity    string
	Output    string
	Datestart string
	Dateend   string
}

func HandleReports(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		entity := c.QueryParam("entity")
		output := c.QueryParam("output")
		datestart := c.QueryParam("datestart")
		dateend := c.QueryParam("dateend")

		params := ReportParams{
			Entity:    entity,
			Output:    output,
			Datestart: datestart,
			Dateend:   dateend,
		}

		switch entity {
		case "order":
			fallthrough
		case "orders":
			o := NewOrderReports(params)
			return o.RangedReport(dbClient, c)
		}

		return utils.ApiError{
			Message: "Entity not found",
		}
	}
}
