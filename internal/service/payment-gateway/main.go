package payment_gateway

import (
	"errors"
	"open-pos/internal/model"

	"gorm.io/gorm"
)

type PaymentGateway interface {
	ChargeTransaction(o *model.Order, out *map[string]any) error
	CancelTransaction(o *model.Order, out *map[string]any) error
	StatusTransaction(o *model.Order, out *map[string]any) error
	SettleTransaction(param any, out *map[string]any) error
}

func NewPaymentGateway(paymentMethodCode string, tx *gorm.DB) (PaymentGateway, error) {
	switch paymentMethodCode {
	case "midtrans_qris":
		param := MidtransParams{
			PaymentType: "qris",
			QrisAcuirer: "gopay",
		}
		midtrans := NewMidtrans(param, tx)
		return &midtrans, nil
	default:
		return nil, errors.New("Payment gateway not found")
	}
}
