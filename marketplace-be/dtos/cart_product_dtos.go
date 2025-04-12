package dtos

type AddToCartInput struct {
	ProductPID string `json:"productId"`
	Quantity   int    `json:"quantity"`
}

type UpdateCartItemInput struct {
	ProductPID string `json:"productId"`
	Quantity   int    `json:"quantity"`
}

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
