package handlers

import (
	"net/http"

	"marketplace-be/auth"
	"marketplace-be/dtos"
	"marketplace-be/services"

	"github.com/gin-gonic/gin"
)

func AddToCart(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	var input dtos.AddToCartInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	if input.ProductPID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Product ID is required"})
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

	c.JSON(http.StatusCreated, gin.H{"message": "Added to cart"})
}

func GetCartProducts(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	products, err := services.GetCartProductsService(userUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve cart products"})
		return
	}
	c.JSON(http.StatusOK, products)
}

func GetCartProductsCount(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	count, err := services.GetCartProductsCountService(userUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to get cart products count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

func UpdateCartProduct(c *gin.Context) {
	var input dtos.UpdateCartProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	if input.ProductPID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Product ID is required"})
		return
	}

	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	// Call the service and get the updated order details
	response, err := services.UpdateCartProductService(input.ProductPID, input.Quantity, userUid)
	if err != nil {
		switch err {
		case services.ErrProductNotFound:
			c.JSON(http.StatusNotFound, gin.H{"message": "Product not found"})
		case services.ErrInsufficientProductQuantity:
			c.JSON(http.StatusConflict, gin.H{"message": "Not enough product in stock"})
		case services.ErrCartProductNotFound:
			c.JSON(http.StatusNotFound, gin.H{"message": "Cart product not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, response)
}

func RemoveCartProduct(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))
	productId := c.Param("pid")

	response, removeErr := services.RemoveCartProductService(productId, userUid)
	if removeErr != nil {
		switch removeErr {
		case services.ErrCartProductNotFound:
			c.JSON(http.StatusNotFound, gin.H{"message": "Cart product not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": removeErr.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, response)
}

func ClearCart(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	if err := services.ClearCartService(userUid); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to clear cart"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared"})
}
