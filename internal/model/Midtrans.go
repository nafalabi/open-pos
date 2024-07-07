package model

type MidtransEvent struct {
	BaseModelWithTimestamp
	OrderID   string `json:"order_id" gorm:"index"`
	RefID     string `json:"ref_id" gorm:"index"`
	RawData   string `json:"raw_data"`
	EventType string `json:"event_type" gorm:"index"`
}
