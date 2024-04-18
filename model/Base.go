package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Base struct {
	ID        string         `sql:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
  CreatedAt time.Time      `json:"created_at" ts_type:"string"`
  UpdatedAt time.Time      `json:"updated_at" ts_type:"string"`
	DeletedAt gorm.DeletedAt `sql:"index" json:"-"`
}

func (base *Base) BeforeCreate(tx *gorm.DB) error {
	id := uuid.NewString()
	base.ID = id
	return nil
}
