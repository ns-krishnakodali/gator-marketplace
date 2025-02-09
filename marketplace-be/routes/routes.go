package routes

import (
	"net/http"

	"marketplace-be/auth"
	"marketplace-be/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.PUT("/signup", handlers.Signup)
	router.POST("/login", handlers.Login)

	router.GET("/health", func(context *gin.Context) {
		context.JSON(http.StatusOK, gin.H{
			"message": "Server up and running!",
		})
	})

	apiProtected := router.Group("/api")
	apiProtected.Use(auth.AuthMiddleware())
	{
		apiProtected.GET("/protected", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "You have accessed a protected endpoint!"})
		})
	}
}
