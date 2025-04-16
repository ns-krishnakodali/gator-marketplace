package dtos

type AddToCartInput struct {
	ProductPID string `json:"productId"`
	Quantity   int    `json:"quantity"`
}

type UpdateCartProductInput struct {
	ProductPID string `json:"productId"`
	Quantity   int    `json:"quantity"`
}

type CartResponse struct {
	CartProducts  []CartProductResponse `json:"cartProducts"`
	ProductsTotal float64               `json:"productsTotal"`
	HandlingFee   float64               `json:"handlingFee"`
	TotalCost     float64               `json:"totalCost"`
}

type CartProductResponse struct {
	AddedQuantity int     `json:"addedQuantity"`
	MaxQuantity   int     `json:"maxQuantity"`
	PID           string  `json:"pid"`
	ProductName   string  `json:"productName"`
	ProductPrice  float64 `json:"productPrice"`
	PrimaryImage  string  `json:"primaryImage"`
}

type CartModifyResponse struct {
	ProductsTotal float64 `json:"productsTotal"`
	HandlingFee   float64 `json:"handlingFee"`
	TotalCost     float64 `json:"totalCost"`
}
