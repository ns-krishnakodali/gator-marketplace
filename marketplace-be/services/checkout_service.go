package services

import (
	"fmt"
	"marketplace-be/database"
	"marketplace-be/dtos"
	"marketplace-be/models"
)

func GetCheckoutCartDetailsService(userUID string) (dtos.CheckoutOrderDetailsResponse, error) {
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

func GetCheckoutProductDetailsService(productPID string, quantity int) (dtos.CheckoutOrderDetailsResponse, error) {
	var product models.Product
	err := database.DB.Omit("id").Where("pid = ?", productPID).First(&product).Error
	if err != nil {
		return dtos.CheckoutOrderDetailsResponse{}, ErrProductNotFound
	}

	if product.Quantity < quantity {
		return dtos.CheckoutOrderDetailsResponse{}, ErrInsufficientProductQuantity
	}

	productDetail := dtos.CheckoutProductDetail{
		Quantity:    quantity,
		ProductName: product.Name,
	}

	productDetail.ProductTotalPrice = float64(quantity) * product.Price
	checkoutProductsTotal := productDetail.ProductTotalPrice
	totalCost := checkoutProductsTotal + HandlingFee

	return dtos.CheckoutOrderDetailsResponse{
		CheckoutProductDetails: []dtos.CheckoutProductDetail{productDetail},
		ProductsTotal:          checkoutProductsTotal,
		HandlingFee:            HandlingFee,
		TotalCost:              totalCost,
	}, nil
}
