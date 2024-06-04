package enum

type OrderStatus string

const (
	StatusPending  OrderStatus = "pending"
	StatusCanceled OrderStatus = "canceled"
	StatusPaid     OrderStatus = "paid"
)

func (status OrderStatus) CustomValidate() bool {
	switch status {
	case StatusPending,
		StatusCanceled,
		StatusPaid:
		return true
	default:
		return false
	}
}
