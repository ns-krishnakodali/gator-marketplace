package services

import (
	"fmt"
	"marketplace-be/database"
	"marketplace-be/dtos"
	"marketplace-be/models"

	"github.com/google/uuid"
)

func GetCheckoutCartDetailsService(userUID string) (dtos.CheckoutOrderDetailsResponse, error) {
	var cartProducts []models.CartProduct
	if err := database.DB.Where("user_uid = ? AND is_delete = ?", userUID, false).
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

func CheckoutCartOrderService(input *dtos.CheckoutOrderInput, userUID string) (string, error) {
	var cartProducts []models.CartProduct
	if err := database.DB.Where("user_uid = ? AND is_delete = ?", userUID, false).
		Preload("Product").
		Find(&cartProducts).Error; err != nil {
		return "", fmt.Errorf("failed to fetch cart products: %v", err)
	}

	if len(cartProducts) == 0 {
		return "", ErrEmptyCart
	}

	// Create a new order
	orderID := uuid.New().String()
	order := models.Order{
		OrderID:         orderID,
		UserUID:         userUID,
		MeetupLocation:  input.MeetupAddress,
		MeetupDate:      input.MeetupDate,
		MeetupTime:      input.MeetupTime,
		AdditionalNotes: input.AdditionalNotes,
		PaymentMethod:   input.PaymentMethod,
		OrderStatus:     models.OrderPlaced,
	}

	if err := database.DB.Create(&order).Error; err != nil {
		return "", ErrFailedToCreateOrder
	}

	var products []models.Product
	for _, cartProduct := range cartProducts {
		products = append(products, cartProduct.Product)
	}

	if err := database.DB.Model(&order).Association("Products").Append(products); err != nil {
		return "", fmt.Errorf("failed to associate products with order: %v", err)
	}

	// Clear cart after successful order i.e. soft delete.
	if err := ClearCartService(userUID); err != nil {
		return "", err
	}

	return orderID, nil
}
