package handlers

import (
	"net/http"

	"marketplace-be/auth"
	"marketplace-be/models"
	"marketplace-be/services"

	"github.com/gin-gonic/gin"
)

func AddToCart(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	var input models.AddToCartInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	err := services.AddToCartService(userUid, input.ProductPID, input.Quantity)
	if err != nil {
		switch err {
		case services.ErrProductNotFound:
			c.JSON(http.StatusNotFound, gin.H{"message": "Product not found"})
		case services.ErrInsufficientProductQuantity:
			c.JSON(http.StatusConflict, gin.H{"message": "Not enough product in stock"})
		case services.ErrProductAlreadyAdded:
			c.JSON(http.StatusConflict, gin.H{"message": "Product already added to cart"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, "Added to cart")
}

func GetCartItems(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	items, err := services.GetCartItemsService(userUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve cart items"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func UpdateCartItem(c *gin.Context) {
	var input models.UpdateCartItemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	// Call the service and get the updated order details
	response, err := services.UpdateCartItemService(input.ProductPID, input.Quantity)
	if err != nil {
		switch err {
		case services.ErrProductNotFound:
			c.JSON(http.StatusNotFound, gin.H{"message": "Product not found"})
		case services.ErrInsufficientProductQuantity:
			c.JSON(http.StatusConflict, gin.H{"message": "Not enough product in stock"})
		case services.ErrCartItemNotFound:
			c.JSON(http.StatusNotFound, gin.H{"message": "Cart item not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"productsTotal": response.ProductsTotal,
		"handlingFees":  response.HandlingFee,
		"totalCost":     response.TotalCost,
	})
}

func RemoveCartItem(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))
	productId := c.Param("pid")

	removeErr := services.RemoveCartItemService(productId, userUid)
	if removeErr != nil {
		switch removeErr {
		case services.ErrCartItemNotFound:
			c.JSON(http.StatusNotFound, gin.H{"message": "Cart item not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": removeErr.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Item removed"})
}

func ClearCart(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	if err := services.ClearCartService(userUid); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to clear cart"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared"})
}
