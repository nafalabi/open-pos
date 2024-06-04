package model

type Product struct {
	BaseModelWithTimestamp
	Name        string     `json:"name" validate:"required"`
	Description string     `json:"description" validate:"required"`
	Price       float64    `json:"price" validate:"min=0"`
	Image       string     `json:"image" validate:"omitempty"`
	Stock       int64      `json:"stock" validate:"min=0"`
	Categories  []Category `json:"categories" gorm:"many2many:product_categories;"`
}
