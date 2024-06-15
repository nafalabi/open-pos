package enum

type OrderStatus string

const (
	StatusPending   OrderStatus = "pending"
	StatusCanceled  OrderStatus = "canceled"
	StatusPaid      OrderStatus = "paid"
	StatusCompleted OrderStatus = "completed"
)

func (status OrderStatus) CustomValidate() bool {
	switch status {
	case StatusPending,
		StatusCanceled,
		StatusPaid,
		StatusCompleted:
		return true
	default:
		return false
	}
}
