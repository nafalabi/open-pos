package report_controller

import (
	"bytes"
	"open-pos/internal/utils"
	"time"

	"github.com/go-pdf/fpdf"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type orderReports struct {
	Params ReportParams
}

type OrderReports interface {
	RangedReport(db *gorm.DB, c echo.Context) error
	rangedPDF(db *gorm.DB, c echo.Context) error
	rangedCSV(db *gorm.DB, c echo.Context) error
	rangedMeta(db *gorm.DB, c echo.Context) error
}

func NewOrderReports(params ReportParams) orderReports {
	o := orderReports{}
	o.Params = params
	return o
}

func (o orderReports) RangedReport(db *gorm.DB, c echo.Context) error {
	datestart, error1 := time.Parse("2006-01-02", o.Params.Datestart)
	dateend, error2 := time.Parse("2006-01-02", o.Params.Dateend)

	if error1 != nil || error2 != nil {
		return utils.ApiError{
			Message: "Invalid date range",
		}
	}

	datestart = datestart.Round(time.Hour * 24)
	dateend = dateend.Round(time.Hour * 24)
	dateend = dateend.Add(time.Hour * 24)

	diffInDays := dateend.Sub(datestart).Hours() / 24
	if diffInDays > 62 {
		return utils.ApiError{
			Message: "Can't select date range for more than 2 months",
		}
	}

	switch o.Params.Output {
	case "csv":
		return o.rangedCSV(db, c)
	case "pdf":
		return o.rangedPDF(db, c)
	case "meta":
		return o.rangedMeta(db, c)
	default:
		return utils.ApiError{
			Message: "Invalid output",
		}
	}
}

func (o orderReports) rangedPDF(db *gorm.DB, c echo.Context) error {
	var result bytes.Buffer

	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "", 16)
	pdf.Cell(40, 10, "Not Implemented")

	err := pdf.Output(&result)
	if err != nil {
		return utils.ApiError{
			Message: "Can't generate pdf result",
		}
	}

	c.Response().Header().Set("Content-Disposition", `inline; filename="order-report.pdf"`)
	return c.Blob(200, "application/pdf", result.Bytes())
}

func (o orderReports) rangedCSV(db *gorm.DB, c echo.Context) error {
	return utils.ApiError{
		Message: "Not implemented",
	}
}

func (o orderReports) rangedMeta(db *gorm.DB, c echo.Context) error {
	// var orders []model.Order
	//
	// query := db.Model(&model.Order{})
	// query = query.Order(clause.OrderByColumn{
	// 	Column: clause.Column{Name: "created_at"},
	// 	Desc:   true,
	// })
	// query.Where("created_at BETWEEN ? AND ?", o.Params.Datestart, o.Params.Dateend)
	// query.Preload("Items").Find(&orders)
	//
	// return utils.SendSuccess(c, orders)
  return utils.SendSuccess(c, true)
}
