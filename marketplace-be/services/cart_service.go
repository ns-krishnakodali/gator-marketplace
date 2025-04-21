package services

import (
	"fmt"
	"marketplace-be/database"
	"marketplace-be/dtos"
	"marketplace-be/models"
	"strconv"
)

// AddToCartService reduces the product stock, then creates or increments a CartProduct.
func AddToCartService(userUID, productPID string, requestedQty int) error {
	if requestedQty <= 0 {
		return ErrInvalidProductQuantity
	}

	var product models.Product
	if err := database.DB.Where("pid = ?", productPID).First(&product).Error; err != nil {
		return ErrProductNotFound
	}

	var existingCartProduct models.CartProduct
	if err := database.DB.Where("user_uid = ? AND product_p_id = ? AND is_delete = ?", userUID, productPID, false).
		First(&existingCartProduct).Error; err == nil {
		return ErrProductAlreadyAdded
	}

	if product.Quantity < requestedQty {
		return ErrInsufficientProductQuantity
	}

	// No change to product.Quantity here
	newCartProduct := models.CartProduct{
		UserUID:    userUID,
		ProductPID: productPID,
		Quantity:   requestedQty,
	}
	if err := database.DB.Create(&newCartProduct).Error; err != nil {
		return fmt.Errorf("failed to create cart product: %v", err)
	}

	return nil
}

func GetCartProductsService(userUID string) (dtos.CartResponse, error) {
	var cartProducts []models.CartProduct
	if err := database.DB.Where("user_uid = ? AND is_delete = ?", userUID, false).
		Order("created_at desc").
		Preload("Product.Images", "is_main = ?", true).
		Find(&cartProducts).Error; err != nil {
		return dtos.CartResponse{}, fmt.Errorf("failed to fetch cart products: %v", err)
	}

	var responses []dtos.CartProductResponse
	var cartProductsTotal float64

	for _, cartProduct := range cartProducts {
		primaryImage := ""
		if len(cartProduct.Product.Images) > 0 {
			primaryImage = cartProduct.Product.Images[0].Url
		}

		response := dtos.CartProductResponse{
			AddedQuantity: cartProduct.Quantity,
			MaxQuantity:   cartProduct.Product.Quantity,
			PID:           cartProduct.Product.Pid,
			ProductName:   cartProduct.Product.Name,
			ProductPrice:  cartProduct.Product.Price,
			PrimaryImage:  primaryImage,
		}
		responses = append(responses, response)

		// Calculate total product cost (price * quantity)
		cartProductsTotal += cartProduct.Product.Price * float64(cartProduct.Quantity)
	}

	// Calculate final totalCost
	totalCost := cartProductsTotal + HandlingFee

	return dtos.CartResponse{
		CartProducts:  responses,
		ProductsTotal: cartProductsTotal,
		HandlingFee:   HandlingFee,
		TotalCost:     totalCost,
	}, nil
}

func GetCartProductsCountService(userUID string) (string, error) {
	var count int64
	if err := database.DB.Model(&models.CartProduct{}).
		Where("user_uid = ? AND is_delete = ?", userUID, false).
		Count(&count).Error; err != nil {
		return "", fmt.Errorf("failed to count cart products: %v", err)
	}

	if count > 10 {
		return "10+", nil
	}
	return strconv.FormatInt(count, 10), nil
}

func UpdateCartProductService(productPID string, newQty int, UserUid string) (dtos.CartModifyResponse, error) {
	if newQty <= 0 {
		newQty = 1
	}

	var cartProduct models.CartProduct
	if err := database.DB.
		Where("product_p_id = ? AND is_delete = ?", productPID, false).
		Preload("Product").
		First(&cartProduct).Error; err != nil {
		return dtos.CartModifyResponse{}, ErrCartProductNotFound
	}

	product := cartProduct.Product
	diff := newQty - cartProduct.Quantity
	if diff > 0 && product.Quantity < diff {
		return dtos.CartModifyResponse{}, ErrInsufficientProductQuantity
	}

	cartProduct.Quantity = newQty
	if err := database.DB.Save(&cartProduct).Error; err != nil {
		return dtos.CartModifyResponse{}, fmt.Errorf("failed to update cart product")
	}

	var cartProductsTotal float64
	err := database.DB.
		Table("cart_products").
		Select("COALESCE(SUM(products.price * cart_products.quantity), 0)").
		Joins("JOIN products ON cart_products.product_p_id = products.pid").
		Where("cart_products.user_uid = ? AND cart_products.is_delete = ?", UserUid, false).
		Scan(&cartProductsTotal).Error

	if err != nil {
		return dtos.CartModifyResponse{}, fmt.Errorf("failed to calculate cart total: %v", err)
	}
	totalCost := cartProductsTotal + HandlingFee

	return dtos.CartModifyResponse{
		ProductsTotal: cartProductsTotal,
		HandlingFee:   HandlingFee,
		TotalCost:     totalCost,
	}, nil
}

func RemoveCartProductService(productId string, userUID string) (dtos.CartModifyResponse, error) {
	result := database.DB.
		Where("product_p_id = ? AND user_uid = ? AND is_delete = ?", productId, userUID, false).
		Delete(&models.CartProduct{})

	if result.Error != nil {
		return dtos.CartModifyResponse{}, fmt.Errorf("failed to remove cart product: %v", result.Error)
	}

	if result.RowsAffected == 0 {
		return dtos.CartModifyResponse{}, ErrCartProductNotFound
	}

	var cartProductsTotal float64
	err := database.DB.
		Table("cart_products").
		Select("COALESCE(SUM(products.price * cart_products.quantity), 0)").
		Joins("JOIN products ON cart_products.product_p_id = products.pid").
		Where("cart_products.user_uid = ? AND cart_products.is_delete = ?", userUID, false).
		Scan(&cartProductsTotal).Error

	if err != nil {
		return dtos.CartModifyResponse{}, fmt.Errorf("failed to calculate cart total: %v", err)
	}

	totalCost := cartProductsTotal + HandlingFee

	return dtos.CartModifyResponse{
		ProductsTotal: cartProductsTotal,
		HandlingFee:   HandlingFee,
		TotalCost:     totalCost,
	}, nil
}

// ClearCartService removes all products for a user.
func ClearCartService(userUID string) error {
	if err := database.DB.Model(&models.CartProduct{}).
		Where("user_uid = ? AND is_delete = ?", userUID, false).
		Update("is_delete", true).Error; err != nil {
		return fmt.Errorf("failed to clear cart: %v", err)
	}
	return nil
}
