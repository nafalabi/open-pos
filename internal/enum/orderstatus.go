package enum

type OrderStatus string

const (
	StatusPending   OrderStatus = "pending"
	StatusCanceled  OrderStatus = "canceled"
	StatusPaid      OrderStatus = "paid"
	StatusCompleted OrderStatus = "completed"
	StatusExpired   OrderStatus = "expired"
)

func (status OrderStatus) CustomValidate() bool {
	switch status {
	case StatusPending,
		StatusCanceled,
		StatusPaid,
		StatusCompleted,
		StatusExpired:
		return true
	default:
		return false
	}
}
