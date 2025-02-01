package main

import (
	"net/http"

	"marketplace-be/auth"
	"marketplace-be/database"

	"github.com/gin-gonic/gin"
)

func main() {
	database.ConnectDatabase()

	router := gin.Default()

	protected := router.Group("/")
	protected.Use(auth.AuthMiddleware())

	router.GET("/health", func(context *gin.Context) {
		context.JSON(http.StatusOK, gin.H{
			"message": "Server up and running!",
		})
	})

	router.Run(":5000")
}
