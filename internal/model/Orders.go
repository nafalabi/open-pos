package model

import (
	"fmt"
	"open-pos/internal/enum"
	"strings"
	"time"

	"gorm.io/gorm"
)

type Order struct {
	BaseModelWithTimestamp
	OrderNumber   string           `gorm:"uniqueIndex" json:"order_number"`
	Recipient     string           `gorm:"index" json:"recipient"`
	Items         []OrderItem      `gorm:"foreignKey:OrderID" json:"items"`
	Total         float64          `json:"total"`
	SubTotal      float64          `json:"sub_total"`
	PaymentFee    float64          `json:"payment_fee"`
	PaymentMethod string           `json:"payment_method"`
	Status        enum.OrderStatus `json:"status"`
	ExternalRef   string           `json:"external_ref"`
	Remarks       string           `json:"remarks"`
}

func (order *Order) BeforeCreate(tx *gorm.DB) error {
	err := order.BaseModel.BeforeCreate(tx)
	if err != nil {
		return nil
	}

	if order.OrderNumber == "" {
		timeRef := time.Now().Format("060102150405.000")
		timeRef = strings.Replace(timeRef, ".", "", 1)
		orderNumber := fmt.Sprintf("ORDER/%s/%s", order.PaymentMethod, timeRef)
		order.OrderNumber = orderNumber
	}
	return nil
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
