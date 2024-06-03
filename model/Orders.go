package model

import (
	"fmt"
	"strings"
	"time"

	"gorm.io/gorm"
)

type Order struct {
	BaseModelWithTimestamp
	OrderNumber   string        `gorm:"uniqueIndex" json:"order_number"`
	Recipient     string        `gorm:"index" json:"recipient"`
	Items         []OrderItem   `gorm:"foreignKey:OrderID" json:"items"`
	Total         float64       `json:"total"`
	PaymentMethod PaymentMethod `json:"payment_method"`
	Status        OrderStatus   `json:"status"`
	ExternalRef   string        `json:"external_ref"`
	Remarks       string        `json:"remarks"`
}

func (order *Order) BeforeCreate(tx *gorm.DB) error {
	order.BaseModel.BeforeCreate(tx)
	if order.OrderNumber == "" {
		timeRef := time.Now().Format("060102150405.000")
		timeRef = strings.Replace(timeRef, ".", "", 1)
		orderNumber := fmt.Sprintf("ORDER/%s/%s", order.PaymentMethod, timeRef)
		order.OrderNumber = orderNumber
	}
	return nil
}

type PaymentMethod string
type OrderStatus string

const (
	PaymentMethodCash     PaymentMethod = "cash"
	PaymentMethodQris     PaymentMethod = "qris"
	PaymentMethodTransfer PaymentMethod = "trans"
	StatusPending         OrderStatus   = "pending"
	StatusCanceled        OrderStatus   = "canceled"
	StatusPaid            OrderStatus   = "paid"
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

type OrderItem struct {
	BaseModel
	OrderID   string   `gorm:"index" json:"order_id"`
	ProductID *string  `gorm:"index" json:"product_id"`
	Product   *Product `gorm:"omitempty" json:"product,omitempty"`
	Quantity  int      `json:"quantity"`
	PriceEach float64  `json:"price_each"`
	SubTotal  float64  `json:"total"`
}
