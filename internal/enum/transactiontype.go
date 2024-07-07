package enum

type TransactionType string

const (
	TransactionPay    TransactionType = "pay"
	TransactionRefund TransactionType = "refund"
)

func (transType TransactionType) CustomValidate() bool {
	switch transType {
	case TransactionPay, TransactionRefund:
		return true
	default:
		return false
	}
}
