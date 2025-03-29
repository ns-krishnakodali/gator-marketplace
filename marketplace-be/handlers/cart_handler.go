package handlers

import (
	"net/http"
	"strconv"

	"marketplace-be/auth"
	"marketplace-be/services"

	"github.com/gin-gonic/gin"
)



func AddToCart(c *gin.Context) {
	userEmail, _ := auth.ExtractUserID(c.GetHeader("Authorization"))
	userUID := userEmail // or if you have a real mapping from email -> Uid

	var input AddToCartInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	item, err := services.AddToCartService(userUID, input.ProductPID, input.Quantity)
	if err != nil {
		switch err {
		case services.ErrProductNotFound:
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		case services.ErrInsufficientProductQuantity:
			c.JSON(http.StatusConflict, gin.H{"error": "Not enough product in stock"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, item)
}

func GetCartItems(c *gin.Context) {
	userEmail, err := auth.ExtractUserID(c.GetHeader("Authorization"))

	userUID := userEmail

	items, err := services.GetCartItemsService(userUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve cart items"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func UpdateCartItem(c *gin.Context) {

	var input UpdateCartItemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	updatedItem, updateErr := services.UpdateCartItemService(input.CartItemID, input.Quantity)
	if updateErr != nil {
		switch updateErr {
		case services.ErrProductNotFound:
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		case services.ErrInsufficientProductQuantity:
			c.JSON(http.StatusConflict, gin.H{"error": "Not enough product in stock"})
		case services.ErrCartItemNotFound:
			c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": updateErr.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, updatedItem)
}

func RemoveCartItem(c *gin.Context) {
	cartItemIDParam := c.Param("cartItemID")
	cartItemID, err := strconv.Atoi(cartItemIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cartItemID"})
		return
	}

	removeErr := services.RemoveCartItemService(cartItemID)
	if removeErr != nil {
		switch removeErr {
		case services.ErrCartItemNotFound:
			c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": removeErr.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Item removed"})
}

func ClearCart(c *gin.Context) {
	userEmail, _ := auth.ExtractUserID(c.GetHeader("Authorization"))
	userUID := userEmail

	if err := services.ClearCartService(userUID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared"})
}
