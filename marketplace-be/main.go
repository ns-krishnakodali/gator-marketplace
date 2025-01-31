package main

import (
	"net/http"

	"marketplace-be/database"

	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDatabase()

	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Server up and running!",
		})
	})

	router.Run(":5000")
}
