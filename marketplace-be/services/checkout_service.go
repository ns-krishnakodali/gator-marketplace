package services

import (
	"fmt"
	"marketplace-be/database"
	"marketplace-be/dtos"
	"marketplace-be/models"
)

func GetCheckoutOrderDetailsService(userUID string) (dtos.CheckoutOrderDetailsResponse, error) {
	var cartProducts []models.CartProduct
	if err := database.DB.Where("user_uid = ?", userUID).
		Order("created_at desc").
		Preload("Product").
		Find(&cartProducts).Error; err != nil {
		return dtos.CheckoutOrderDetailsResponse{}, fmt.Errorf("failed to fetch cart products: %v", err)
	}

	var checkoutProductDetails []dtos.CheckoutProductDetail
	var checkoutProductsTotal float64

	for _, cartProduct := range cartProducts {

		productDetail := dtos.CheckoutProductDetail{
			Quantity:    cartProduct.Quantity,
			ProductName: cartProduct.Product.Name,
		}
		productDetail.ProductTotalPrice = float64(cartProduct.Quantity) * cartProduct.Product.Price
		checkoutProductDetails = append(checkoutProductDetails, productDetail)

		checkoutProductsTotal += productDetail.ProductTotalPrice
	}

	// Calculate final totalCost
	totalCost := checkoutProductsTotal + HandlingFee

	return dtos.CheckoutOrderDetailsResponse{
		CheckoutProductDetails: checkoutProductDetails,
		ProductsTotal:          checkoutProductsTotal,
		HandlingFee:            HandlingFee,
		TotalCost:              totalCost,
	}, nil
}
