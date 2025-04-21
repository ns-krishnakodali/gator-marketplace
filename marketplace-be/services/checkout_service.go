package services

import (
	"errors"
	"fmt"
	"marketplace-be/database"
	"marketplace-be/dtos"
	"marketplace-be/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
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

	var products []models.Product
	totalCost := 0.0
	productQuantityMap := make(models.ProductQuantityMap)
	for _, cartProduct := range cartProducts {
		products = append(products, cartProduct.Product)
		productQuantityMap[cartProduct.ProductPID] = cartProduct.Quantity
		totalCost += float64(cartProduct.Quantity) * cartProduct.Product.Price
	}

	orderUID := uuid.New().String()
	order := models.Order{
		OrderUID:           orderUID,
		UserUID:            userUID,
		MeetupLocation:     input.MeetupAddress,
		MeetupDate:         input.MeetupDate,
		MeetupTime:         input.MeetupTime,
		AdditionalNotes:    input.AdditionalNotes,
		PaymentMethod:      input.PaymentMethod,
		OrderStatus:        models.OrderPlaced,
		ProductQuantityMap: productQuantityMap,
		TotalCost:          totalCost,
	}

	if err := database.DB.Create(&order).Error; err != nil {
		return "", ErrFailedToCreateOrder
	}

	if err := database.DB.Model(&order).Association("Products").Append(products); err != nil {
		_ = database.DB.Delete(&models.Order{}, "order_uid = ?", orderUID)
		return "", fmt.Errorf("failed to associate products with order: %v", err)
	}

	if err := ClearCartService(userUID); err != nil {
		return "", err
	}

	return orderUID, nil
}

func CheckoutCartProductService(input *dtos.CheckoutProductOrderInput, userUID string) (string, error) {
	var product models.Product
	res := database.DB.Where("pid = ?", input.ProductId).First(&product)
	if errors.Is(res.Error, gorm.ErrRecordNotFound) {
		return "", ErrProductNotFound
	}
	if res.Error != nil {
		return "", res.Error
	}

	if product.Quantity < input.Quantity {
		return "", ErrInsufficientProductQuantity
	}

	productQuantityMap := make(models.ProductQuantityMap)
	productQuantityMap[product.Pid] = input.Quantity

	orderUID := uuid.New().String()
	order := models.Order{
		OrderUID:           orderUID,
		UserUID:            userUID,
		MeetupLocation:     input.MeetupAddress,
		MeetupDate:         input.MeetupDate,
		MeetupTime:         input.MeetupTime,
		AdditionalNotes:    input.AdditionalNotes,
		PaymentMethod:      input.PaymentMethod,
		PriceProposal:      *input.PriceProposal,
		OrderStatus:        models.OrderPlaced,
		ProductQuantityMap: productQuantityMap,
		TotalCost:          float64(input.Quantity) * product.Price,
	}

	if err := database.DB.Create(&order).Error; err != nil {
		fmt.Printf("error when creating order: %v", err)
		return "", ErrFailedToCreateOrder
	}

	products := []models.Product{product}
	if err := database.DB.Model(&order).Association("Products").Append(products); err != nil {
		if delErr := database.DB.Delete(&models.Order{}, "order_uid = ?", orderUID).Error; delErr != nil {
			return "", fmt.Errorf("failed to associate products with order: %v; additionally failed to remove order: %v", err, delErr)
		}
		return "", fmt.Errorf("failed to associate products with order: %v", err)
	}

	return orderUID, nil
}
