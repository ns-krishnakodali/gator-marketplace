package handlers

import (
	"errors"
	"marketplace-be/auth"
	"marketplace-be/dtos"
	"marketplace-be/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetAccountDetails(c *gin.Context) {
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	// Fetch account details from the service
	accountDetails, err := services.GetAccountDetailsService(userUid)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrFailedFetching):
			c.JSON(http.StatusNotFound, gin.H{"message": "User account not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Internal Server Error"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"accountDetails": accountDetails})
}

func UpdateAccountDetails(c *gin.Context) {
	var input dtos.AccountDetailsInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input format"})
		return
	}

	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	// Call service to modify account details
	err := services.UpdateAccountDetailsService(&input, userUid)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrEmailNotMatching),
			errors.Is(err, services.ErrEmptyName),
			errors.Is(err, services.ErrEmptyMobileNumber):
			c.JSON(http.StatusUnprocessableEntity, gin.H{"message": "Invalid input data, please check again"})
		case errors.Is(err, services.ErrInvalidEmailFormat):
			c.JSON(http.StatusUnprocessableEntity, gin.H{"message": "Invalid email format, please enter valid UFL email"})
		case errors.Is(err, services.ErrInvalidMobileNumber):
			c.JSON(http.StatusUnprocessableEntity, gin.H{"message": "Invalid mobile number, please follow xxx-xxx-xxxx format"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Internal Server Error"})
		}
		return
	}

	c.JSON(http.StatusNoContent, "Updated user details")
}

func UpdatePassword(c *gin.Context) {
	var input dtos.PasswordInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input format"})
		return
	}

	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	// Call service to modify account details
	err := services.UpdatePasswordService(&input, userUid)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrInvalidCredentials):
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid password. Please check and try again."})
		case errors.Is(err, services.ErrSamePassword):
			c.JSON(http.StatusConflict, gin.H{"message": "New password, cannot be same as the current password."})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Internal Server Error"})
		}
		return
	}

	c.Status(http.StatusNoContent)
}
