package handlers

import (
	"errors"
	"marketplace-be/auth"
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

func CheckoutCardOrder(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	orderDetails, err := services.GetCheckoutCartDetailsService(userUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve order details"})
		return
	}
	c.JSON(http.StatusOK, orderDetails)
}
