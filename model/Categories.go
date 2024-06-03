package model

type CategoryFillable struct {
	Name string `json:"name" validate:"required" gorm:"uniqueIndex"`
}

func (this CategoryFillable) Fill(product *Category) {
	product.Name = this.Name
}

type Category struct {
	CategoryFillable
	BaseModelWithTimestamp
}
