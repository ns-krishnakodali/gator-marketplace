package routes

import (
	"net/http"

	"marketplace-be/auth"
	"marketplace-be/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.POST("/login", handlers.Login)
	router.POST("/signup", handlers.Signup)

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

		// Product endpoints
		apiProtected.GET("/products", handlers.GetProducts)
		apiProtected.GET("/product/:pid", handlers.GetProductByPID)
		apiProtected.POST("/product", handlers.CreateProduct)
		apiProtected.PUT("/product/:pid", handlers.UpdateProduct)
		apiProtected.DELETE("/product/:pid", handlers.DeleteProduct)

		// Account endpoints
		apiProtected.GET("/account-details", handlers.GetAccountDetails)
		apiProtected.PUT("/update-account", handlers.UpdateAccountDetails)
		apiProtected.PUT("/update-password", handlers.UpdatePassword)

		// Cart endpoints
		apiProtected.GET("/cart", handlers.GetCartProducts)
		apiProtected.GET("/cart/count", handlers.GetCartProductsCount)
		apiProtected.POST("/cart", handlers.AddToCart)
		apiProtected.PUT("/cart", handlers.UpdateCartProduct)
		apiProtected.DELETE("/cart/:pid", handlers.RemoveCartProduct)
		apiProtected.DELETE("/cart", handlers.ClearCart)

		// Checkout endpoints
		apiProtected.GET("/checkout/cart", handlers.GetCheckoutCartDetails)
		apiProtected.GET("/checkout/product", handlers.GetCheckoutProductDetails)
		apiProtected.POST("/checkout/cart", handlers.CheckoutCartOrder)
		apiProtected.POST("/checkout/product", handlers.CheckoutCartProduct)

		// Order endpoints
		apiProtected.GET("/order/:oid", handlers.GetOrderDetails)
		apiProtected.GET("/user-orders", handlers.GetUserOrders)
	}
}
