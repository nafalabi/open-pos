package model

import "open-pos/internal/enum"

type Transaction struct {
	BaseModelWithTimestamp
	ExpectAmount float64              `json:"expect_amount" validate:"required"`
	InputAmount  float64              `json:"input_amount" validate:"required"`
	TipAmount    float64              `json:"tip_amount"`
	ChangeAmount float64              `json:"change_amount"`
	PaymentFee   float64              `json:"payment_fee"`
	Type         enum.TransactionType `json:"type" validate:"required"`
	Gateway      string               `json:"gateway"`
	PaymentType  string               `json:"payment_type"`
	Reference    string               `json:"reference"`
	Notes        string               `json:"notes"`
	OrderID      string               `gorm:"index" json:"order_id"`
}
