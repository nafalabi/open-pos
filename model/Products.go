package model

type ProductFillable struct {
	Name string `json:"name" validate:"required"`
}

func (this ProductFillable) Combine (product *Product) {
  product.Name = this.Name
}

type Product struct {
	ProductFillable
	Base
}
