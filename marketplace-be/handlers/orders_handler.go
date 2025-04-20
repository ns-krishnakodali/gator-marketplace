package handlers

import (
	"errors"
	"marketplace-be/auth"
	"marketplace-be/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetOrderDetails(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))
	orderId := c.Param("oid")

	orderDetails, err := services.GetOrderDetailsService(orderId, userUid)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrOrderNotFound):
			c.JSON(http.StatusNotFound, gin.H{"message": "No order found matching the given ID"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve order details"})
		}
		return

	}
	c.JSON(http.StatusOK, orderDetails)
}

func GetUserOrders(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	orderDetails, err := services.GetUserOrderDetails(userUid)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrOrderNotFound):
			c.JSON(http.StatusNotFound, gin.H{"message": "No order found matching the given ID"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve order details"})
		}
		return

	}
	c.JSON(http.StatusOK, orderDetails)
}
