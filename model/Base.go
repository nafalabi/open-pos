package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BaseModel struct {
	ID string `sql:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
}

func (base *BaseModel) BeforeCreate(tx *gorm.DB) error {
	if base.ID == "" {
		id := uuid.NewString()
		base.ID = id
	}
	return nil
}

type BaseModelWithTimestamp struct {
	BaseModel
	CreatedAt time.Time      `gorm:"index" json:"created_at" ts_type:"string"`
	UpdatedAt time.Time      `json:"updated_at" ts_type:"string"`
	DeletedAt gorm.DeletedAt `sql:"index" json:"-"`
}
