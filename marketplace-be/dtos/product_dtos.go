package dtos

import (
	"marketplace-be/models"

	"time"
)

type ProductInput struct {
	Name        string          `form:"name"`
	Description string          `form:"description"`
	Price       float64         `form:"price"`
	Category    models.Category `form:"category"`
	Quantity    int             `form:"quantity"`
}

type ProductImageInput struct {
	MimeType string `json:"mimeType" binding:"required"`
	URL      string `json:"url" binding:"required"`
	IsMain   bool   `json:"isMain"`
}

type GetProductsResponse struct {
	Products   []ProductDetails `json:"products"`
	Page       int32            `json:"page"`
	PageSize   int32            `json:"pageSize"`
	TotalItems int32            `json:"totalItems"`
	TotalPages int32            `json:"totalPages"`
}

type ProductResponse struct {
	Pid             string            `json:"pid"`
	UserUID         string            `json:"userUid"`
	Name            string            `json:"name"`
	Price           float64           `json:"price"`
	Description     string            `json:"description"`
	Category        models.Category   `json:"category"`
	Quantity        int               `json:"quantity"`
	PopularityScore float64           `json:"popularityScore"`
	PostedAt        time.Time         `json:"postedAt"`
	PostedBy        string            `json:"postedBy"`
	Images          []ProductImageDTO `json:"images"`
}

type ProductDetails struct {
	Pid      string          `json:"pid"`
	UserUID  string          `json:"userUid"`
	Name     string          `json:"name"`
	Price    float64         `json:"price"`
	PostedAt time.Time       `json:"postedAt"`
	Image    ProductImageDTO `json:"image"`
}

type ProductImageDTO struct {
	Url      string `json:"url"`
	MimeType string `json:"mimeType"`
	IsMain   bool   `json:"isMain"`
}
