package dtos

import (
	"marketplace-be/models"
)

type CheckoutOrderDetailsResponse struct {
	CheckoutProductDetails []CheckoutProductDetail `json:"orderProductDetails"`
	ProductsTotal          float64                 `json:"productsTotal"`
	HandlingFee            float64                 `json:"handlingFee"`
	TotalCost              float64                 `json:"totalCost"`
}

type CheckoutCartOrderInput struct {
	MeetupAddress   string               `json:"meetupAddress"`
	MeetupDate      string               `json:"meetupDate"`
	MeetupTime      string               `json:"meetupTime"`
	AdditionalNotes string               `json:"additionalNotes"`
	PaymentMethod   models.PaymentMethod `json:"paymentMethod"`
}

type CheckoutProductOrderInput struct {
	MeetupAddress   string               `json:"meetupAddress"`
	MeetupDate      string               `json:"meetupDate"`
	MeetupTime      string               `json:"meetupTime"`
	AdditionalNotes string               `json:"additionalNotes"`
	ProductId       string               `json:"productId"`
	Quantity        int                  `json:"quantity"`
	PaymentMethod   models.PaymentMethod `json:"paymentMethod"`
	PriceProposal   *int                 `json:"priceProposal"`
}

type CheckoutProductDetail struct {
	ProductName       string  `json:"productName"`
	Quantity          int     `json:"quantity"`
	ProductTotalPrice float64 `json:"productTotalPrice"`
}
