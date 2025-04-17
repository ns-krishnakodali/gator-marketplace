package handlers

import (
	"marketplace-be/auth"
	"marketplace-be/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCheckoutOrderDetails(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	orderDetails, err := services.GetCheckoutOrderDetailsService(userUid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve order details"})
		return
	}
	c.JSON(http.StatusOK, orderDetails)
}
