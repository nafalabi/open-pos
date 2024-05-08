package model

type ProductFillable struct {
	Name        string    `json:"name" validate:"required"`
	Description string    `json:"description" validate:"required"`
	Price       int64     `json:"price" validate:"number,min=0"`
	Image       string    `json:"image" validate:"uri"`
	Stock       int64     `json:"stock" validate:"number,min=0"`
	Categories  *[]string `json:"categories" gorm:"-"`
}

func (this ProductFillable) Fill(product *Product) {
	product.Name = this.Name
	product.Description = this.Description
	product.Price = this.Price
	product.Image = this.Image
	product.Stock = this.Stock
}

type Product struct {
	ProductFillable
	Categories []Category `json:"categories" gorm:"many2many:product_categories;"`
	Base
}
