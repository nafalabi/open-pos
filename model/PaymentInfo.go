package model

import (
	"time"

	"gorm.io/datatypes"
)

type PaymentInfo struct {
	BaseModelWithTimestamp
	OrderID        string                              `json:"order_id" gorm:"index"`
	PaymentGateway string                              `json:"payment_gateway"`
	PaymentType    string                              `json:"payment_type"`
	MidtransDetail *datatypes.JSONType[MidtransDetail] `json:"midtrans_detail"`
	ExpireAt       time.Time                           `json:"expire_at"`
}

type MidtransDetail struct {
	RefID             string `json:"ref_id"`
	StatusCode        string `json:"status_code"`
	TransactionStatus string `json:"transaction_status"`
	QRLink            string `json:"qr_link"`
	QRString          string `json:"qr_string"`
	VirtualAccount    string `json:"virtual_account"`
	// Actions           []MidtransAction `json:"actions"`
}

// type MidtransAction struct {
// 	Name   string `json:"name"`
// 	Method string `json:"method"`
// 	Url    string `json:"url"`
// }
