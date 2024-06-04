package model

import (
	enum "open-pos/enum"
)

type User struct {
	BaseModelWithTimestamp
	Name     string         `json:"name" validate:"required"`
	Email    string         `json:"email" validate:"email"`
	Phone    string         `json:"phone"` // `json:"phone" validate:"e164"`
	Level    enum.UserLevel `json:"level" validate:"custom"`
	Password string         `json:"-" validate:"required"`
}
