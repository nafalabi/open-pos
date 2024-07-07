package model

type Category struct {
	BaseModelWithTimestamp
	Name string `json:"name" gorm:"uniqueIndex"`
}
