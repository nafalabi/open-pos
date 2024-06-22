package controller

import (
	"errors"
	"open-pos/utils"
	"slices"

	"github.com/labstack/echo/v4"
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
			Code:     "midtrans_qris",
			Name:     "QRIS",
			FeeType:  PercentagePaymentFee,
			Variable: 0.7 / 100,
		},
	}
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

		return utils.SendSuccessPaginated(c, methods, 1, len(methods), len(methods))
	}
}

// @Summary	Calculate payment fee
// @Security	ApiKeyAuth
// @Tags		Payment
// @Accept		json
// @Produce	json
// @Param		code	path	string						true	"paymentmethod code"
// @Param		body	body	CalculatePaymentFeePayload	true	"Payload"
// @Router		/payment-methods/{code} [post]
func CalculatePaymentFee(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		var payload CalculatePaymentFeePayload
		err := utils.BindAndValidate(c, &payload)
		if err != nil {
			return utils.SendError(c, errors.New("Payload is not valid"))
		}

		methods := GetAvailableMethod()
		payment_code := c.Param("code")

		idx := slices.IndexFunc(methods, func(m PaymentMethod) bool { return m.Code == payment_code })
		if idx == -1 {
			return utils.SendError(c, errors.New("The specified payment method can't be found"))
		}

		method := methods[idx]
		var paymentFee float64

		if method.FeeType == PercentagePaymentFee {
			paymentFee = payload.TotalAmount * method.Variable
		} else if method.FeeType == FixedPaymentFee {
			paymentFee = method.Variable
		}

		result := map[string]float64{
			"payment_fee": paymentFee,
		}

		return utils.SendSuccess(c, result)
	}
}
