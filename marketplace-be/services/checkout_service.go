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

	return dtos.CheckoutOrderDetailsResponse{
		CheckoutProductDetails: checkoutProductDetails,
		ProductsTotal:          checkoutProductsTotal,
		HandlingFee:            HandlingFee,
		TotalCost:              checkoutProductsTotal + HandlingFee,
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

	return dtos.CheckoutOrderDetailsResponse{
		CheckoutProductDetails: []dtos.CheckoutProductDetail{productDetail},
		ProductsTotal:          checkoutProductsTotal,
		HandlingFee:            HandlingFee,
		TotalCost:              checkoutProductsTotal + HandlingFee,
	}, nil
}

func CheckoutCartOrderService(input *dtos.CheckoutCartOrderInput, userUID string) (string, error) {
	var cartProducts []models.CartProduct
	if err := database.DB.Where("user_uid = ? AND is_delete = ?", userUID, false).
		Preload("Product").
		Find(&cartProducts).Error; err != nil {
		return "", fmt.Errorf("failed to fetch cart products: %v", err)
	}

	if len(cartProducts) == 0 {
		return "", ErrEmptyCart
	}

	productQuantityMap := make(models.ProductQuantityMap)
	var products []models.Product
	for _, cartProduct := range cartProducts {
		products = append(products, cartProduct.Product)
		productQuantityMap[cartProduct.ProductPID] = cartProduct.Quantity
	}

	orderID := uuid.New().String()
	order := models.Order{
		OrderID:            orderID,
		UserUID:            userUID,
		MeetupLocation:     input.MeetupAddress,
		MeetupDate:         input.MeetupDate,
		MeetupTime:         input.MeetupTime,
		AdditionalNotes:    input.AdditionalNotes,
		PaymentMethod:      input.PaymentMethod,
		OrderStatus:        models.OrderPlaced,
		ProductQuantityMap: productQuantityMap,
	}

	if err := database.DB.Create(&order).Error; err != nil {
		return "", ErrFailedToCreateOrder
	}

	if err := database.DB.Model(&order).Association("Products").Append(products); err != nil {
		_ = database.DB.Delete(&models.Order{}, "order_id = ?", orderID)
		return "", fmt.Errorf("failed to associate products with order: %v", err)
	}

	if err := ClearCartService(userUID); err != nil {
		return "", err
	}

	return orderID, nil
}

func CheckoutCartProductService(input *dtos.CheckoutProductOrderInput, userUID string) (string, error) {
	var product models.Product
	if err := database.DB.Where("pid = ?", input.ProductId).Find(&product).Error; err != nil {
		return "", ErrProductNotFound
	}

	if product.Quantity < input.Quantity {
		return "", ErrInsufficientProductQuantity
	}

	productQuantityMap := make(models.ProductQuantityMap)
	productQuantityMap[product.Pid] = input.Quantity

	orderID := uuid.New().String()
	order := models.Order{
		OrderID:            orderID,
		UserUID:            userUID,
		MeetupLocation:     input.MeetupAddress,
		MeetupDate:         input.MeetupDate,
		MeetupTime:         input.MeetupTime,
		AdditionalNotes:    input.AdditionalNotes,
		PaymentMethod:      input.PaymentMethod,
		PriceProposal:      *input.PriceProposal,
		OrderStatus:        models.OrderPlaced,
		ProductQuantityMap: productQuantityMap,
	}

	if err := database.DB.Create(&order).Error; err != nil {
		return "", ErrFailedToCreateOrder
	}

	products := []models.Product{product}
	if err := database.DB.Model(&order).Association("Products").Append(products); err != nil {
		if delErr := database.DB.Delete(&models.Order{}, "order_id = ?", orderID).Error; delErr != nil {
			return "", fmt.Errorf("failed to associate products with order: %v; additionally failed to remove order: %v", err, delErr)
		}
		return "", fmt.Errorf("failed to associate products with order: %v", err)
	}

	return orderID, nil
}
