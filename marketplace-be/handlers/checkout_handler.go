package handlers

import (
	"errors"
	"marketplace-be/auth"
	"marketplace-be/dtos"
	"marketplace-be/services"

	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetCheckoutCartDetails(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	orderDetails, err := services.GetCheckoutCartDetailsService(userUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve order details"})
		return
	}
	c.JSON(http.StatusOK, orderDetails)
}

func GetCheckoutProductDetails(c *gin.Context) {
	pid := c.Query("pid")
	qty := c.Query("qty")

	var quantity int
	if qty != "" {
		var err error
		quantity, err = strconv.Atoi(qty)
		if err != nil || quantity <= 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Invalid quantity"})
			return
		}
	}

	orderDetails, err := services.GetCheckoutProductDetailsService(pid, quantity)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrInsufficientProductQuantity):
			c.JSON(http.StatusNotFound, gin.H{"message": "Requested quantity exceeds available stock"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve order details"})
		}
		return
	}
	c.JSON(http.StatusOK, orderDetails)
}

func CheckoutCartOrder(c *gin.Context) {
	var input dtos.CheckoutCartOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input format"})
		return
	}

	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	orderId, err := services.CheckoutCartOrderService(&input, userUid)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrEmptyCart):
			c.JSON(http.StatusBadRequest, gin.H{"message": "Your cart is empty, add products to place an order"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Couldn't place the order, please retry"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"orderId": orderId})
}

func CheckoutCartProduct(c *gin.Context) {
	var input dtos.CheckoutProductOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input format"})
		return
	}

	if input.ProductId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Product ID is required"})
		return
	}

	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	orderId, err := services.CheckoutCartProductService(&input, userUid)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrProductNotFound):
			c.JSON(http.StatusBadRequest, gin.H{"message": "Product not found, check again."})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Couldn't place the order, please retry"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"orderId": orderId})
}
