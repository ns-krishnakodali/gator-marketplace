package dtos

import "marketplace-be/models"

type ProductInput struct {
	Name        string              `json:"name" binding:"required"`
	Description string              `json:"description,omitempty"`
	Price       float64             `json:"price" binding:"required"`
	Category    models.Category     `json:"category" binding:"required"`
	Quantity    int                 `json:"quantity"`
	Images      []ProductImageInput `json:"images,omitempty"`
}

type ProductImageInput struct {
	MimeType string `json:"mimeType" binding:"required"`
	URL      string `json:"url" binding:"required"`
	IsMain   bool   `json:"isMain"`
}
