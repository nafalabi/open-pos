package model

import "open-pos/enum"

type Transaction struct {
	BaseModelWithTimestamp
	ExpectAmount float64              `json:"expect_amount" validate:"required"`
	InputAmount  float64              `json:"input_amount" validate:"required"`
	TipAmount    float64              `json:"tip_amount"`
	ChangeAmount float64              `json:"change_amount"`
	Type         enum.TransactionType `json:"type" validate:"required"`
	Gateway      string               `json:"gateway" validate:"required"`
	Reference    string               `json:"reference"`
	Notes        string               `json:"notes"`
	OrderID      string               `gorm:"index" json:"order_id"`
}
