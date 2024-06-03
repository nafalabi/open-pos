package model

type ProductFillable struct {
	Name        string  `json:"name" validate:"required"`
	Description string  `json:"description" validate:"required"`
	Price       float64 `json:"price" validate:"min=0"`
	Image       string  `json:"image" validate:"omitempty"`
	// Image       string   `json:"image" validate:"omitempty,uri"` // ts types converter cant support uri for now
	Stock      int64    `json:"stock" validate:"min=0"`
	Categories []string `json:"categories" gorm:"-"`
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
	BaseModelWithTimestamp
}
