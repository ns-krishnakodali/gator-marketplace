package main

import (
	"net/http"
	"os"

	"marketplace-be/auth"
	"marketplace-be/database"
	"marketplace-be/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	database.ConnectDatabase()

	router := gin.Default()

	// Public endpoints for signup and login.
	router.PUT("/signup", handlers.Signup)
	router.POST("/login", handlers.Login)

	protected := router.Group("/")
	protected.Use(auth.AuthMiddleware())

	router.GET("/health", func(context *gin.Context) {
		context.JSON(http.StatusOK, gin.H{
			"message": "Server up and running!",
		})
	})

	// Protected endpoints under the /api group
	apiProtected := router.Group("/api")
	apiProtected.Use(auth.AuthMiddleware())
	{
		apiProtected.GET("/protected", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "You have accessed a protected endpoint!"})
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000" // Default to 5000 if not set
	}
	router.Run(":" + port)
}
