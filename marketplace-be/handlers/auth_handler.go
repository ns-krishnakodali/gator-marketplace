package handlers

import (
	"log"
	"net/http"

	"marketplace-be/models"
	"marketplace-be/services"

	"github.com/gin-gonic/gin"
)

const InternalServerError = "Internal Server Error"

func Login(c *gin.Context) {
	var input models.LoginInput

	// Bind JSON input to struct
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input format"})
		return
	}

	// Authenticate user and generate token
	token, err := services.LoginService(&input)
	if err != nil {
		switch err.Error() {
		case "user_not_found":
			c.JSON(http.StatusNotFound, gin.H{"message": "Invalid credentials, try again"})
		case "invalid_credentials":
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials, try again"})
		case "token_error":
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": InternalServerError})
		}
		return
	}

	// Return generated token
	c.JSON(http.StatusOK, gin.H{"token": token})
}

func Signup(c *gin.Context) {
	var input models.SignupInput

	// Bind JSON input to struct
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input format"})
		return
	}

	// Signup user
	if err := services.SignupService(&input); err != nil {
		switch err.Error() {
		case "email_exists":
			log.Printf("Attempted signup with already registered email: %s", input.Email)
			c.JSON(http.StatusConflict, gin.H{"message": "Email already registered"})
		case "hash_error":
			log.Printf("Error hashing password: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": InternalServerError})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": InternalServerError})
		}
		return
	}

	// Return success message
	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully"})
}
