package dtos

import (
	"marketplace-be/models"
	"time"
)

type OrderDetailsResponse struct {
	OrderID             string                `json:"orderId"`
	OrderStatus         models.OrderStatus    `json:"orderStatus"`
	DatePlaced          time.Time             `json:"datePlaced"`
	PaymentMethod       models.PaymentMethod  `json:"paymentMethod"`
	Location            string                `json:"location"`
	Date                string                `json:"date"`
	Time                string                `json:"time"`
	Notes               string                `json:"notes"`
	OrderProductDetails []OrderProductDetails `json:"orderProductDetails"`
	HandlingFee         float64               `json:"handlingFee"`
	TotalCost           float64               `json:"totalCost"`
}

type UserOrdersResponse struct {
	UserOrders  []UserOrderDetails `json:"userOrders"`
	TotalOrders int64              `json:"totalOrders"`
}

type UserOrderDetails struct {
	OrderID       string               `json:"orderId"`
	OrderStatus   models.OrderStatus   `json:"orderStatus"`
	DatePlaced    time.Time            `json:"datePlaced"`
	PaymentMethod models.PaymentMethod `json:"paymentMethod"`
	TotalItems    int                  `json:"totalItems"`
	TotalCost     float64              `json:"totalCost"`
}

type OrderProductDetails struct {
	UserUid       string         `json:"userUid"`
	DisplayName   string         `json:"displayName"`
	Contact       string         `json:"contact"`
	OrderProducts []OrderProduct `json:"orderProducts"`
}

type OrderProduct struct {
	Pid      string  `json:"pid"`
	Name     string  `json:"name"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}
