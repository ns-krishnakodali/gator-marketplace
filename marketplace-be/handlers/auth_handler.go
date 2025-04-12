package handlers

import (
	"errors"
	"log"
	"net/http"

	"marketplace-be/dtos"
	"marketplace-be/services"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	var input dtos.LoginInput

	// Bind JSON input to struct
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input format"})
		return
	}

	// Authenticate user and generate token
	token, err := services.LoginService(&input)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			c.JSON(http.StatusNotFound, gin.H{"message": "Invalid credentials, try again"})
		case errors.Is(err, services.ErrInvalidCredentials):
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials, try again"})
		case errors.Is(err, services.ErrTokenGeneration):
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": InternalServerError})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

func Signup(c *gin.Context) {
	var input dtos.SignupInput

	// Bind JSON input to struct
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input format"})
		return
	}

	// Signup user
	if err := services.SignupService(&input); err != nil {
		switch {
		case errors.Is(err, services.ErrEmailExists):
			c.JSON(http.StatusConflict, gin.H{"message": "Email already registered"})
		case errors.Is(err, services.ErrHashingPassword):
			c.JSON(http.StatusInternalServerError, gin.H{"message": InternalServerError})
		case errors.Is(err, services.ErrInvalidEmailFormat):
			c.JSON(http.StatusUnprocessableEntity, gin.H{"message": "Invalid email format. Please enter valid UFL email."})
		case errors.Is(err, services.ErrInvalidMobileNumber):
			c.JSON(http.StatusUnprocessableEntity, gin.H{"message": "Invalid mobile number. Please follow xxx-xxx-xxxx format."})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": InternalServerError})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully"})
}
