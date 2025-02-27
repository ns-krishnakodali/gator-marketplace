package routes

import (
	"net/http"

	"marketplace-be/auth"
	"marketplace-be/handlers"
	"marketplace-be/products"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.POST("/signup", handlers.Signup)
	router.POST("/products", products.CreateProduct)
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

		
		apiProtected.GET("/products", products.GetProducts)
		apiProtected.GET("/products/:pid", products.GetProductByPID)
		apiProtected.PUT("/products/:pid", products.UpdateProduct)
		apiProtected.DELETE("/products/:pid", products.DeleteProduct)

	}
}
