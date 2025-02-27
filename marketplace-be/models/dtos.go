package models

type SignupInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type ProductInput struct {
	Name        string              `json:"name" binding:"required"`
	Description string              `json:"description,omitempty"`
	Price       float64             `json:"price" binding:"required"`
	Category    Category            `json:"category" binding:"required"`
	Quantity    int                 `json:"quantity"`
	Images      []ProductImageInput `json:"images,omitempty"`
}

type ProductImageInput struct {
	MimeType string `json:"mimeType" binding:"required"`
	URL      string `json:"url" binding:"required"`
	IsMain   bool   `json:"isMain"`
}
