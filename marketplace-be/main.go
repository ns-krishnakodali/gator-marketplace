package main

import (
	"os"

	"marketplace-be/database"
	"marketplace-be/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	database.ConnectDatabase()

	router := gin.Default()

	routes.SetupRoutes(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000" // Default to 5000 if not set
	}
	router.Run(":" + port)
}
