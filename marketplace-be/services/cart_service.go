package services

import (
	"fmt"
	"marketplace-be/database"
	"marketplace-be/models"
)

// AddToCartService reduces the product stock, then creates or increments a CartItem.
func AddToCartService(userUID, productPID string, requestedQty int) (*models.CartItem, error) {
	if requestedQty <= 0 {
		requestedQty = 1
	}

	// 1) Find the product
	var product models.Product
	if err := database.DB.Where("pid = ?", productPID).First(&product).Error; err != nil {
		return nil, ErrProductNotFound
	}
	if product.Quantity < requestedQty {
		// Not enough stock
		return nil, ErrInsufficientProductQuantity
	}

	// 2) Decrement product stock
	product.Quantity -= requestedQty
	if err := database.DB.Save(&product).Error; err != nil {
		return nil, fmt.Errorf("failed to update product stock: %v", err)
	}

	// 3) Check if user already has this item in cart
	var cartItem models.CartItem
	err := database.DB.Where("user_uid = ? AND product_p_id = ?", userUID, productPID).First(&cartItem).Error
	if err == nil {
		// If found, increment quantity
		cartItem.Quantity += requestedQty
		if saveErr := database.DB.Save(&cartItem).Error; saveErr != nil {
			return nil, fmt.Errorf("failed to update cart item: %v", saveErr)
		}
		return &cartItem, nil
	}

	// If not found, create a new cart item
	newItem := models.CartItem{
		UserUID:    userUID,
		ProductPID: productPID,
		Quantity:   requestedQty,
	}
	if createErr := database.DB.Create(&newItem).Error; createErr != nil {
		return nil, fmt.Errorf("failed to create cart item: %v", createErr)
	}
	return &newItem, nil
}

// GetCartItemsService returns all items in a user's cart.
func GetCartItemsService(userUID string) ([]models.CartItem, error) {
	var items []models.CartItem
	if err := database.DB.Where("user_uid = ?", userUID).Preload("Product").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch cart items: %v", err)
	}
	return items, nil
}

// UpdateCartItemService changes the quantity of an existing CartItem.
// We also adjust the Product stock accordingly.
func UpdateCartItemService(cartItemID int, newQty int) (*models.CartItem, error) {
	if newQty <= 0 {
		newQty = 1
	}

	var cartItem models.CartItem
	if err := database.DB.First(&cartItem, cartItemID).Error; err != nil {
		return nil, ErrCartItemNotFound
	}

	var product models.Product
	if err := database.DB.Where("pid = ?", cartItem.ProductPID).First(&product).Error; err != nil {
		return nil, ErrProductNotFound
	}

	// If newQty > oldQty, we need more stock from Product
	if newQty > cartItem.Quantity {
		diff := newQty - cartItem.Quantity
		if product.Quantity < diff {
			return nil, ErrInsufficientProductQuantity
		}
		// reduce product stock by the difference
		product.Quantity -= diff
		if err := database.DB.Save(&product).Error; err != nil {
			return nil, fmt.Errorf("failed to decrement product quantity")
		}
	} else if newQty < cartItem.Quantity {
		// If user is reducing the cart quantity, we can optionally restore the difference to product's stock
		diff := cartItem.Quantity - newQty
		product.Quantity += diff
		if err := database.DB.Save(&product).Error; err != nil {
			return nil, fmt.Errorf("failed to increment product quantity")
		}
	}

	cartItem.Quantity = newQty
	if err := database.DB.Save(&cartItem).Error; err != nil {
		return nil, fmt.Errorf("failed to update cart item")
	}

	return &cartItem, nil
}

// RemoveCartItemService deletes a single cart item.
// We also optionally restore the product’s stock.
func RemoveCartItemService(cartItemID int) error {
	var cartItem models.CartItem
	if err := database.DB.First(&cartItem, cartItemID).Error; err != nil {
		return ErrCartItemNotFound
	}

	// restore the product's quantity
	var product models.Product
	if err := database.DB.Where("pid = ?", cartItem.ProductPID).First(&product).Error; err == nil {
		product.Quantity += cartItem.Quantity
		if errSave := database.DB.Save(&product).Error; errSave != nil {
			return fmt.Errorf("failed to restore product quantity: %v", errSave)
		}
	}

	if err := database.DB.Delete(&models.CartItem{}, cartItemID).Error; err != nil {
		return fmt.Errorf("failed to remove cart item: %v", err)
	}
	return nil
}

// ClearCartService removes all items for a user,
// and restores product stock for each cart item.
func ClearCartService(userUID string) error {
	var items []models.CartItem
	if err := database.DB.Where("user_uid = ?", userUID).Find(&items).Error; err != nil {
		return fmt.Errorf("failed to find cart items")
	}

	// restore product stock
	for _, it := range items {
		var product models.Product
		if err := database.DB.Where("pid = ?", it.ProductPID).First(&product).Error; err == nil {
			product.Quantity += it.Quantity
			if errSave := database.DB.Save(&product).Error; errSave != nil {
				return fmt.Errorf("failed to restore product quantity for item %d", it.ID)
			}
		}
	}

	if err := database.DB.Where("user_uid = ?", userUID).Delete(&models.CartItem{}).Error; err != nil {
		return fmt.Errorf("failed to clear cart: %v", err)
	}

	return nil
}
