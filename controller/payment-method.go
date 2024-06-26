package controller

import (
	"open-pos/utils"
	"slices"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/samber/lo"
	"gorm.io/gorm"
)

type PaymentFeeType string

const (
	FixedPaymentFee      PaymentFeeType = "fixed"
	PercentagePaymentFee PaymentFeeType = "percentage"
)

type PaymentMethod struct {
	Code     string         `json:"code"`
	Name     string         `json:"name"`
	FeeType  PaymentFeeType `json:"fee_type"`
	Variable float64        `json:"variable"`
}

type CalculatePaymentFeePayload struct {
	TotalAmount float64 `json:"totalamount" validation:"required"`
}

func GetAvailableMethod() []PaymentMethod {
	return []PaymentMethod{
		{
			Code:     "cash",
			Name:     "Cash",
			FeeType:  FixedPaymentFee,
			Variable: 0,
		},
		{
			Code:     "midtrans_qris",
			Name:     "QRIS Dynamic",
			FeeType:  PercentagePaymentFee,
			Variable: 0.7 / 100,
		},
	}
}

func FindMethod(code string) (PaymentMethod, error) {
	var result PaymentMethod

	methods := GetAvailableMethod()
	idx := slices.IndexFunc(methods, func(m PaymentMethod) bool { return m.Code == code })
	if idx == -1 {
		error := utils.ApiError{
			Message: "The specified payment method can't be found",
		}
		return result, error
	}

	method := methods[idx]
	return method, nil
}

func CalculatePaymentFee(method PaymentMethod, totalAmount float64) (paymentFee float64) {
	if method.FeeType == PercentagePaymentFee {
		paymentFee = totalAmount * method.Variable
	} else if method.FeeType == FixedPaymentFee {
		paymentFee = method.Variable
	}

	return paymentFee
}

// @Summary	list of payment method
// @Security	ApiKeyAuth
// @Tags		Payment
// @Accept		json
// @Produce	json
// @Router		/payment-methods [get]
func ListPaymentMethod(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		methods := GetAvailableMethod()

		safeList := lo.Map(methods, func(item PaymentMethod, _ int) map[string]any {
			return map[string]any{
				"code": item.Code,
				"name": item.Name,
			}
		})

		return utils.SendSuccessPaginated(c, safeList, 1, len(methods), len(methods))
	}
}

// @Summary	find payment method by id
// @Security	ApiKeyAuth
// @Tags		Payment
// @Accept		json
// @Produce	json
// @Param		code	path	string	true	"payment method code"
// @Router		/payment-methods/{code} [get]
func FindPaymentMethod(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		payment_code := c.Param("code")

		method, err := FindMethod(payment_code)
		if err != nil {
			return err
		}

		return utils.SendSuccess(c, method)
	}
}

// @Summary	get payment fee
// @Security	ApiKeyAuth
// @Tags		Payment
// @Accept		json
// @Produce	json
// @Param		code		path	string	true	"payment method code"
// @Param		totalamount	query	string	false	"total amount"
//
// @Router		/payment-methods/{code}/fee [get]
func GetPaymentFee(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		payment_code := c.Param("code")
		totalAmountStr := c.QueryParam("totalamount")

		totalAmount, err := strconv.ParseFloat(totalAmountStr, 64)
		if err != nil {
			return utils.ApiError{
				Message: "Payload is not valid",
			}
		}

		method, err := FindMethod(payment_code)
		if err != nil {
			return err
		}
		paymentFee := CalculatePaymentFee(method, totalAmount)

		result := map[string]float64{
			"payment_fee": paymentFee,
		}

		return utils.SendSuccess(c, result)
	}
}
