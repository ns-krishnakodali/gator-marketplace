package main

import (
	"os"

	"marketplace-be/auth"
	"marketplace-be/aws"
	"marketplace-be/database"
	"marketplace-be/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	database.ConnectDatabase()

	router := gin.Default()
	router.Use(auth.CORSMiddleware())
	routes.SetupRoutes(router)

	aws.InitializeS3()

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000" // Default to 5000 if not set
	}
	router.Run(":" + port)
}
