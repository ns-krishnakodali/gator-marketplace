package models

// Request Inputs
type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type SignupInput struct {
	Name     string `json:"name" binding:"required"`
	Mobile   string `json:"mobile" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
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

type AccountDetails struct {
	ImageUrl    string `json:"imageUrl"`
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Email       string `json:"email"`
	Mobile      string `json:"mobile"`
}

type AccountDetailsInput struct {
	Name        string `json:"name" binding:"required"`
	DisplayName string `json:"displayName" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Mobile      string `json:"mobile" binding:"required"`
}

type PasswordInput struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

type AddToCartInput struct {
	ProductPID string `json:"productId"`
	Quantity   int    `json:"quantity"`
}

type UpdateCartItemInput struct {
	ProductPID string `json:"productId"`
	Quantity   int    `json:"quantity"`
}

// Response Outputs

type CartResponse struct {
	CartProducts  []CartItemResponse `json:"cartProducts"`
	ProductsTotal float64            `json:"productsTotal"`
	HandlingFee   float64            `json:"handlingFee"`
	TotalCost     float64            `json:"totalCost"`
}

type CartItemResponse struct {
	AddedQuantity int     `json:"addedQuantity"`
	MaxQuantity   int     `json:"maxQuantity"`
	PID           string  `json:"pid"`
	ProductName   string  `json:"productName"`
	ProductPrice  float64 `json:"productPrice"`
	PrimaryImage  string  `json:"primaryImage"`
}

type CartUpdateResponse struct {
	ProductsTotal float64 `json:"productsTotal"`
	HandlingFee   float64 `json:"handlingFee"`
	TotalCost     float64 `json:"totalCost"`
}
