package services

import (
	"fmt"
	"marketplace-be/database"
	"marketplace-be/models"
)

// AddToCartService reduces the product stock, then creates or increments a CartItem.
func AddToCartService(userUID, productPID string, requestedQty int) error {
	if requestedQty <= 0 {
		requestedQty = 1
	}

	var product models.Product
	if err := database.DB.Where("pid = ?", productPID).First(&product).Error; err != nil {
		return ErrProductNotFound
	}

	var existingCartProduct models.CartProduct
	if err := database.DB.Where("user_uid = ? AND product_p_id = ?", userUID, productPID).
		First(&existingCartProduct).Error; err == nil {
		return ErrProductAlreadyAdded
	}

	if product.Quantity < requestedQty {
		return ErrInsufficientProductQuantity
	}

	// No change to product.Quantity here
	newItem := models.CartProduct{
		UserUID:    userUID,
		ProductPID: productPID,
		Quantity:   requestedQty,
	}
	if err := database.DB.Create(&newItem).Error; err != nil {
		return fmt.Errorf("failed to create cart item: %v", err)
	}

	return nil
}

// GetCartItemsService returns all items in a user's cart.
func GetCartItemsService(userUID string) (models.CartResponse, error) {
	var cartProducts []models.CartProduct
	if err := database.DB.Where("user_uid = ?", userUID).
		Preload("Product.Images", "is_main = ?", true).
		Find(&cartProducts).Error; err != nil {
		return models.CartResponse{}, fmt.Errorf("failed to fetch cart items: %v", err)
	}

	var responses []models.CartItemResponse
	var cartProductsTotal float64

	for _, cartProduct := range cartProducts {
		primaryImage := ""
		if len(cartProduct.Product.Images) > 0 {
			primaryImage = cartProduct.Product.Images[0].Url
		}

		response := models.CartItemResponse{
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
	totalCost := cartProductsTotal + HandlingFees

	return models.CartResponse{
		CartProducts:  responses,
		ProductsTotal: cartProductsTotal,
		HandlingFee:   HandlingFees,
		TotalCost:     totalCost,
	}, nil
}

func UpdateCartItemService(productPID string, newQty int) (models.CartUpdateResponse, error) {
	if newQty <= 0 {
		newQty = 1
	}

	// Fetch the cart item by productPID
	var cartItem models.CartProduct
	if err := database.DB.Where("product_p_id = ?", productPID).First(&cartItem).Error; err != nil {
		return models.CartUpdateResponse{}, ErrCartItemNotFound
	}

	// Fetch the product data only once
	var product models.Product
	if err := database.DB.Where("pid = ?", cartItem.ProductPID).First(&product).Error; err != nil {
		return models.CartUpdateResponse{}, ErrProductNotFound
	}

	// Calculate the difference between the new quantity and the existing quantity
	diff := newQty - cartItem.Quantity
	if diff > 0 && product.Quantity < diff {
		return models.CartUpdateResponse{}, ErrInsufficientProductQuantity
	}

	// Update the cart item quantity
	cartItem.Quantity = newQty
	if err := database.DB.Save(&cartItem).Error; err != nil {
		return models.CartUpdateResponse{}, fmt.Errorf("failed to update cart item")
	}

	// Now, calculate the total cost, handling fees, and other necessary details
	var cartProducts []models.CartProduct
	if err := database.DB.Where("user_uid = ?", cartItem.UserUID).
		Preload("Product.Images", "is_main = ?", true).
		Find(&cartProducts).Error; err != nil {
		return models.CartUpdateResponse{}, fmt.Errorf("failed to fetch cart items: %v", err)
	}

	var cartProductsTotal float64
	for _, cartProduct := range cartProducts {
		cartProductsTotal += cartProduct.Product.Price * float64(cartProduct.Quantity)
	}

	// Calculate final totalCost
	totalCost := cartProductsTotal + HandlingFees

	return models.CartUpdateResponse{
		ProductsTotal: cartProductsTotal,
		HandlingFee:   HandlingFees,
		TotalCost:     totalCost,
	}, nil
}

func RemoveCartItemService(productId string, userUID string) error {
	var cartItem models.CartProduct
	if err := database.DB.Where("product_p_id = ? AND user_uid = ?", productId, userUID).First(&cartItem).Error; err != nil {
		return ErrCartItemNotFound
	}

	// Remove the cart item
	if err := database.DB.
		Where("product_p_id = ? AND user_uid = ?", productId, userUID).
		Delete(&models.CartProduct{}).Error; err != nil {
		return fmt.Errorf("failed to remove cart item: %v", err)
	}
	return nil
}

// ClearCartService removes all items for a user.
func ClearCartService(userUID string) error {
	if err := database.DB.Where("user_uid = ?", userUID).Delete(&models.CartProduct{}).Error; err != nil {
		return fmt.Errorf("failed to clear cart: %v", err)
	}
	return nil
}
