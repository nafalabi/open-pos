package model

import (
	enum "open-pos/enum"

	"golang.org/x/crypto/bcrypt"
)

type UserBase struct {
	Name  string         `json:"name" validate:"required"`
	Email string         `json:"email" validate:"email"`
	Phone string         `json:"phone"` // `json:"phone" validate:"e164"`
	Level enum.UserLevel `json:"level" validate:"required"`
}

type UserFillable struct {
	UserBase
	Password string `json:"password"`
}

func (this UserFillable) Fill(user *User) error {
	hashedPwd, err := bcrypt.GenerateFromPassword([]byte(this.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Name = this.Name
	user.Email = this.Email
	user.Phone = this.Phone
	user.Level = this.Level
  user.Password = string(hashedPwd)

  return nil
}

type User struct {
	UserBase
	Password string `json:"-" validate:"required"`
	Base
}
