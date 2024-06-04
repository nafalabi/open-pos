package enum

type PaymentMethod string

const (
	PaymentMethodCash     PaymentMethod = "cash"
	PaymentMethodQris     PaymentMethod = "qris"
	PaymentMethodTransfer PaymentMethod = "trans"
)

func (pm PaymentMethod) CustomValidate() bool {
	switch pm {
	case PaymentMethodCash,
		PaymentMethodQris,
		PaymentMethodTransfer:
		return true
	default:
		return false
	}
}
