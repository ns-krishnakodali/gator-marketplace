package handlers_test

import (
	"encoding/json"
	"marketplace-be/auth"
	"marketplace-be/dtos"
	"marketplace-be/handlers"
	"marketplace-be/models"
	"marketplace-be/tests"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func init() {
	// Use test mode so Gin doesn't print too much
	gin.SetMode(gin.TestMode)
}

func TestAddToCart(t *testing.T) {
	db := tests.SetupTestDB(t)

	// Prepare test user
	user := &models.User{
		ID:              1,
		Uid:             "user-uid",
		Email:           "test@ufl.edu",
		DisplayImageUrl: "",
		Name:            "Test User",
		DisplayName:     "GatorUser",
		Mobile:          "123-456-7890",
		PasswordHash:    "$2a$10$examplehashedpassword",
	}
	db.Create(user)

	// Prepare test product
	product := &models.Product{
		ID:          1,
		Pid:         "product-pid",
		UserUID:     user.Uid,
		Name:        "Test Product",
		Description: "Test Description",
		Price:       99.99,
		Category:    models.Electronics,
		PostedBy:    *user,
		Quantity:    10,
	}
	db.Create(product)

	// Create test token
	token, _ := auth.GenerateToken(user.Uid)

	t.Run("Invalid Input Format", func(t *testing.T) {
		c, w := tests.CreateTestContext("POST", "/api/cart", []byte(`{"invalid":"json"}`))
		c.Request.Header.Set("Authorization", token)

		handlers.AddToCart(c)
		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "Product ID is required")
	})

	t.Run("Product Not Found", func(t *testing.T) {
		c, w := tests.CreateTestContext("POST", "/api/cart", []byte(`{"productId":"non-existent-pid","quantity":1}`))
		c.Request.Header.Set("Authorization", token)

		handlers.AddToCart(c)
		require.Equal(t, http.StatusNotFound, w.Code)
		require.Contains(t, w.Body.String(), "Product not found")
	})

	t.Run("Not Enough Product Quantity", func(t *testing.T) {
		c, w := tests.CreateTestContext("POST", "/api/cart", []byte(`{"productId":"product-pid","quantity":20}`))
		c.Request.Header.Set("Authorization", token)

		handlers.AddToCart(c)
		require.Equal(t, http.StatusConflict, w.Code)
		require.Contains(t, w.Body.String(), "Not enough product in stock")
	})

	t.Run("Successful Add To Cart", func(t *testing.T) {
		c, w := tests.CreateTestContext("POST", "/api/cart", []byte(`{"productId":"product-pid","quantity":5}`))
		c.Request.Header.Set("Authorization", token)

		handlers.AddToCart(c)
		require.Equal(t, http.StatusCreated, w.Code)
		require.Contains(t, w.Body.String(), "Added to cart")
	})

	t.Run("Product Already Added", func(t *testing.T) {
		cartProduct := &models.CartProduct{
			ID:         1,
			UserUID:    "user-uid",
			ProductPID: "product-pid",
			Quantity:   2,
			Product:    *product,
		}
		db.Create(cartProduct)

		c, w := tests.CreateTestContext("POST", "/api/cart", []byte(`{"productId":"product-pid","quantity":1}`))
		c.Request.Header.Set("Authorization", token)

		handlers.AddToCart(c)
		require.Equal(t, http.StatusConflict, w.Code)
		require.Contains(t, w.Body.String(), "Product already added to cart")
	})
}

func TestGetCartProducts(t *testing.T) {
	db := tests.SetupTestDB(t)

	// Prepare test user
	user := &models.User{
		ID:              1,
		Uid:             "user-uid",
		Email:           "test@ufl.edu",
		DisplayImageUrl: "",
		Name:            "Test User",
		DisplayName:     "GatorUser",
		Mobile:          "123-456-7890",
		PasswordHash:    "$2a$10$examplehashedpassword",
	}
	db.Create(user)

	// Prepare test product
	db.Create(&models.Product{
		ID:          1,
		Pid:         "product-pid",
		UserUID:     user.Uid,
		Name:        "Test Product",
		Description: "Test Description",
		Price:       99.99,
		Category:    models.Electronics,
		PostedBy:    *user,
		Quantity:    10,
		Images: []models.ProductImage{
			{
				Pid:      "product-pid",
				MimeType: "image/jpeg",
				Url:      "test-image-url.jpg",
				IsMain:   true,
			},
		},
	})

	// Create test token
	token, _ := auth.GenerateToken(user.Uid)

	// Add product to cart first
	c, w := tests.CreateTestContext("POST", "/api/cart", []byte(`{"productId":"product-pid","quantity":5}`))
	c.Request.Header.Set("Authorization", token)
	handlers.AddToCart(c)
	require.Equal(t, http.StatusCreated, w.Code)

	t.Run("Successfully Get Cart Products", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/cart", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetCartProducts(c)
		require.Equal(t, http.StatusOK, w.Code)

		var response dtos.CartResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		// Verify response
		require.Len(t, response.CartProducts, 1)
		require.Equal(t, 5, response.CartProducts[0].AddedQuantity)
		require.Equal(t, "product-pid", response.CartProducts[0].PID)
		require.Equal(t, "Test Product", response.CartProducts[0].ProductName)
		require.Equal(t, 99.99, response.CartProducts[0].ProductPrice)
		require.Greater(t, response.TotalCost, response.ProductsTotal)
	})
}

func TestGetCartProductsCount(t *testing.T) {
	db := tests.SetupTestDB(t)

	// Prepare test user
	user := &models.User{
		ID:              1,
		Uid:             "user-uid",
		Email:           "test@ufl.edu",
		DisplayImageUrl: "",
		Name:            "Test User",
		DisplayName:     "GatorUser",
		Mobile:          "123-456-7890",
		PasswordHash:    "$2a$10$examplehashedpassword",
	}
	db.Create(user)

	// Prepare test product
	db.Create(&models.Product{
		ID:          1,
		Pid:         "product-pid",
		UserUID:     user.Uid,
		Name:        "Test Product",
		Description: "Test Description",
		Price:       99.99,
		Category:    models.Electronics,
		PostedBy:    *user,
		Quantity:    10,
		Images: []models.ProductImage{
			{
				Pid:      "product-pid",
				MimeType: "image/jpeg",
				Url:      "test-image-url.jpg",
				IsMain:   true,
			},
		},
	})

	// Create test token
	token, _ := auth.GenerateToken(user.Uid)

	// Add product to cart first
	c, w := tests.CreateTestContext("POST", "/api/cart", []byte(`{"productId":"product-pid","quantity":5}`))
	c.Request.Header.Set("Authorization", token)
	handlers.AddToCart(c)
	require.Equal(t, http.StatusCreated, w.Code)

	t.Run("Successfully Get Cart Products Count", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/cart/count", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetCartProductsCount(c)
		require.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)
		require.Equal(t, "1", response["count"])
	})
}

func TestUpdateCartProduct(t *testing.T) {
	db := tests.SetupTestDB(t)

	// Prepare test user
	user := &models.User{
		ID:              1,
		Uid:             "user-uid",
		Email:           "test@ufl.edu",
		DisplayImageUrl: "",
		Name:            "Test User",
		DisplayName:     "GatorUser",
		Mobile:          "123-456-7890",
		PasswordHash:    "$2a$10$examplehashedpassword",
	}
	db.Create(user)

	// Prepare test product
	db.Create(&models.Product{
		ID:          1,
		Pid:         "product-pid",
		UserUID:     user.Uid,
		Name:        "Test Product",
		Description: "Test Description",
		Price:       99.99,
		Category:    models.Electronics,
		PostedBy:    *user,
		Quantity:    10,
	})

	// Create test token
	token, _ := auth.GenerateToken(user.Uid)

	// Add product to cart first
	c, w := tests.CreateTestContext("POST", "/api/cart", []byte(`{"productId":"product-pid","quantity":2}`))
	c.Request.Header.Set("Authorization", token)
	handlers.AddToCart(c)
	require.Equal(t, http.StatusCreated, w.Code)

	t.Run("Invalid Input Format", func(t *testing.T) {
		c, w := tests.CreateTestContext("PUT", "/api/cart", []byte(`{"invalid":"data"}`))
		c.Request.Header.Set("Authorization", token)

		handlers.UpdateCartProduct(c)
		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "Product ID is required")
	})

	t.Run("Product Not Found", func(t *testing.T) {
		c, w := tests.CreateTestContext("PUT", "/api/cart", []byte(`{"productId":"non-existent-pid","quantity":1}`))
		c.Request.Header.Set("Authorization", token)

		handlers.UpdateCartProduct(c)
		require.Equal(t, http.StatusNotFound, w.Code)
		require.Contains(t, w.Body.String(), "Cart product not found")
	})

	t.Run("Not Enough Quantity", func(t *testing.T) {
		c, w := tests.CreateTestContext("PUT", "/api/cart", []byte(`{"productId":"product-pid","quantity":15}`))
		c.Request.Header.Set("Authorization", token)

		handlers.UpdateCartProduct(c)
		require.Equal(t, http.StatusConflict, w.Code)
		require.Contains(t, w.Body.String(), "Not enough product in stock")
	})

	t.Run("Successful Update", func(t *testing.T) {
		c, w := tests.CreateTestContext("PUT", "/api/cart", []byte(`{"productId":"product-pid","quantity":5}`))
		c.Request.Header.Set("Authorization", token)

		handlers.UpdateCartProduct(c)
		require.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		// Verify response fields exist
		_, exists := response["productsTotal"]
		require.True(t, exists)
		_, exists = response["handlingFee"]
		require.True(t, exists)
		_, exists = response["totalCost"]
		require.True(t, exists)
	})
}

func TestRemoveCartProduct(t *testing.T) {
	db := tests.SetupTestDB(t)

	// Prepare test user
	user := &models.User{
		ID:              1,
		Uid:             "user-uid",
		Email:           "test@ufl.edu",
		DisplayImageUrl: "",
		Name:            "Test User",
		DisplayName:     "GatorUser",
		Mobile:          "123-456-7890",
		PasswordHash:    "$2a$10$examplehashedpassword",
	}
	db.Create(user)

	// Prepare test product
	product := &models.Product{
		ID:          1,
		Pid:         "product-pid",
		UserUID:     user.Uid,
		Name:        "Test Product",
		Description: "Test Description",
		Price:       99.99,
		Category:    models.Electronics,
		PostedBy:    *user,
		Quantity:    10,
	}
	db.Create(product)

	// Create test token
	token, _ := auth.GenerateToken(user.Uid)

	// Add product to cart first
	c, w := tests.CreateTestContext("POST", "/api/cart", []byte(`{"productId":"product-pid","quantity":2}`))
	c.Request.Header.Set("Authorization", token)
	handlers.AddToCart(c)
	require.Equal(t, http.StatusCreated, w.Code)

	t.Run("Product Not Found", func(t *testing.T) {
		c, w := tests.CreateTestContext("DELETE", "/api/cart/non-existent-pid", nil)
		c.Request.Header.Set("Authorization", token)
		c.Params = []gin.Param{{Key: "pid", Value: "non-existent-pid"}}

		handlers.RemoveCartProduct(c)
		require.Equal(t, http.StatusNotFound, w.Code)
		require.Contains(t, w.Body.String(), "Cart product not found")
	})

	t.Run("Successful Remove", func(t *testing.T) {
		c, w := tests.CreateTestContext("DELETE", "/api/cart/product-pid", nil)
		c.Request.Header.Set("Authorization", token)
		c.Params = []gin.Param{{Key: "pid", Value: "product-pid"}}

		handlers.RemoveCartProduct(c)
		require.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		// Verify response fields exist
		_, exists := response["productsTotal"]
		require.True(t, exists)
		_, exists = response["handlingFee"]
		require.True(t, exists)
		_, exists = response["totalCost"]
		require.True(t, exists)
	})
}

func TestClearCart(t *testing.T) {
	db := tests.SetupTestDB(t)

	// Prepare test user
	user := &models.User{
		ID:              1,
		Uid:             "user-uid",
		Email:           "test@ufl.edu",
		DisplayImageUrl: "",
		Name:            "Test User",
		DisplayName:     "GatorUser",
		Mobile:          "123-456-7890",
		PasswordHash:    "$2a$10$examplehashedpassword",
	}
	db.Create(user)

	// Prepare test product
	product := &models.Product{
		ID:          1,
		Pid:         "product-pid",
		UserUID:     user.Uid,
		Name:        "Test Product",
		Description: "Test Description",
		Price:       99.99,
		Category:    models.Electronics,
		PostedBy:    *user,
		Quantity:    10,
	}
	db.Create(product)

	// Create test token
	token, _ := auth.GenerateToken(user.Uid)

	// Add product to cart first
	c, w := tests.CreateTestContext("POST", "/api/cart", []byte(`{"productId":"product-pid","quantity":2}`))
	c.Request.Header.Set("Authorization", token)
	handlers.AddToCart(c)
	require.Equal(t, http.StatusCreated, w.Code)

	t.Run("Successful Clear Cart", func(t *testing.T) {
		c, w := tests.CreateTestContext("DELETE", "/api/cart", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.ClearCart(c)
		require.Equal(t, http.StatusOK, w.Code)
		require.Contains(t, w.Body.String(), "Cart cleared")
	})
}
