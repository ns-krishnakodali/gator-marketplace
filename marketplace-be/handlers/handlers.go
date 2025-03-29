package handlers

const InternalServerError = "Internal Server Error"

type AddToCartInput struct {
	ProductPID string `json:"product_pid"`
	Quantity   int    `json:"quantity"`
}

// Define a struct that contains both CartItemID and Quantity
type UpdateCartItemInput struct {
	CartItemID int `json:"cartItemID"`
	Quantity   int `json:"quantity"`
}
