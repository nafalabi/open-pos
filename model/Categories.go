package model

type CategoryFillable struct {
	Name        string `json:"name" validate:"required"`
}

func (this CategoryFillable) Fill(product *Product) {
	product.Name = this.Name
}

type Category struct {
	CategoryFillable
	Base
}
