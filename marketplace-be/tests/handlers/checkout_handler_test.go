package handlers_test

import (
	"encoding/json"
	"marketplace-be/auth"
	"marketplace-be/dtos"
	"marketplace-be/handlers"
	"marketplace-be/models"
	"marketplace-be/services"
	"marketplace-be/tests"
	"net/http"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func init() {
	// Use test mode so Gin doesn't print too much
	gin.SetMode(gin.TestMode)
}

func TestGetCheckoutCartDetails(t *testing.T) {
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

	// Create test token
	token, _ := auth.GenerateToken(user.Uid)

	// Prepare test product
	product := &models.Product{
		ID:          1,
		Pid:         "product-pid",
		UserUID:     "seller-uid",
		Name:        "Test Product",
		Description: "Test Description",
		Price:       99.99,
		Category:    models.Electronics,
		PostedBy:    *user,
		Quantity:    10,
	}
	db.Create(product)

	t.Run("Success - Empty Cart", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/checkout/cart", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetCheckoutCartDetails(c)
		require.Equal(t, http.StatusOK, w.Code)

		var response dtos.CheckoutOrderDetailsResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		require.Empty(t, response.CheckoutProductDetails)
		require.Equal(t, float64(0), response.ProductsTotal)
		require.Equal(t, services.HandlingFee, response.HandlingFee)
		require.Equal(t, services.HandlingFee, response.TotalCost)
	})

	t.Run("Success - With Items", func(t *testing.T) {
		// Add items to cart
		cartItem := &models.CartProduct{
			UserUID:    user.Uid,
			ProductPID: product.Pid,
			Quantity:   2,
			IsDelete:   false,
		}
		db.Create(cartItem)

		c, w := tests.CreateTestContext("GET", "/api/checkout/cart", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetCheckoutCartDetails(c)
		require.Equal(t, http.StatusOK, w.Code)

		var response dtos.CheckoutOrderDetailsResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		require.Len(t, response.CheckoutProductDetails, 1)
		require.Equal(t, "Test Product", response.CheckoutProductDetails[0].ProductName)
		require.Equal(t, 2, response.CheckoutProductDetails[0].Quantity)
		require.Equal(t, 99.99*2, response.CheckoutProductDetails[0].ProductTotalPrice)
		require.Equal(t, 99.99*2, response.ProductsTotal)
		require.Equal(t, services.HandlingFee, response.HandlingFee)
		require.Equal(t, 99.99*2+services.HandlingFee, response.TotalCost)
	})
}

func TestGetCheckoutProductDetails(t *testing.T) {
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
		UserUID:     "seller-uid",
		Name:        "Test Product",
		Description: "Test Description",
		Price:       99.99,
		Category:    models.Electronics,
		PostedBy:    *user,
		Quantity:    10,
	}
	db.Create(product)

	t.Run("Success - Valid Product and Quantity", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/checkout/product?pid=product-pid&qty=3", nil)
		c.Request.URL.RawQuery = "pid=product-pid&qty=3"
		c.Params = []gin.Param{
			{Key: "pid", Value: "product-pid"},
			{Key: "qty", Value: "3"},
		}

		handlers.GetCheckoutProductDetails(c)
		require.Equal(t, http.StatusOK, w.Code)

		var response dtos.CheckoutOrderDetailsResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		require.Len(t, response.CheckoutProductDetails, 1)
		require.Equal(t, "Test Product", response.CheckoutProductDetails[0].ProductName)
		require.Equal(t, 3, response.CheckoutProductDetails[0].Quantity)
		expected := 99.99 * 3
		// allow small FP error
		require.InDelta(t, expected, response.CheckoutProductDetails[0].ProductTotalPrice, 0.001)
		require.InDelta(t, expected, response.ProductsTotal, 0.001)
		require.Equal(t, services.HandlingFee, response.HandlingFee)
		require.InDelta(t, expected+services.HandlingFee, response.TotalCost, 0.001)
	})

	t.Run("Invalid Quantity", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/checkout/product?pid=product-pid&qty=invalid", nil)
		c.Request.URL.RawQuery = "pid=product-pid&qty=invalid"
		c.Params = []gin.Param{
			{Key: "pid", Value: "product-pid"},
			{Key: "qty", Value: "invalid"},
		}

		handlers.GetCheckoutProductDetails(c)
		require.Equal(t, http.StatusInternalServerError, w.Code)
		require.Contains(t, w.Body.String(), "Invalid quantity")
	})

	t.Run("Product Not Found", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/checkout/product?pid=non-existent-pid&qty=1", nil)
		c.Request.URL.RawQuery = "pid=non-existent-pid&qty=1"
		c.Params = []gin.Param{
			{Key: "pid", Value: "non-existent-pid"},
			{Key: "qty", Value: "1"},
		}

		handlers.GetCheckoutProductDetails(c)
		require.Equal(t, http.StatusInternalServerError, w.Code)
	})

	t.Run("Insufficient Quantity", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/checkout/product?pid=product-pid&qty=20", nil)
		c.Request.URL.RawQuery = "pid=product-pid&qty=20"
		c.Params = []gin.Param{
			{Key: "pid", Value: "product-pid"},
			{Key: "qty", Value: "20"},
		}

		handlers.GetCheckoutProductDetails(c)
		require.Equal(t, http.StatusNotFound, w.Code)
		require.Contains(t, w.Body.String(), "Requested quantity exceeds available stock")
	})
}

func TestCheckoutCartOrder(t *testing.T) {
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

	// Create test token
	token, _ := auth.GenerateToken(user.Uid)

	// Prepare test product
	product := &models.Product{
		ID:          1,
		Pid:         "product-pid",
		UserUID:     "seller-uid",
		Name:        "Test Product",
		Description: "Test Description",
		Price:       99.99,
		Category:    models.Electronics,
		PostedBy:    *user,
		Quantity:    10,
	}
	db.Create(product)

	meetupDate := time.Now().Format("2006-01-02")
	meetupTime := "14:00"

	t.Run("Invalid Input Format", func(t *testing.T) {
		c, w := tests.CreateTestContext("POST", "/api/checkout/cart", []byte(`{"invalid":"json"}`))
		c.Request.Header.Set("Authorization", token)

		handlers.CheckoutCartOrder(c)
		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "Your cart is empty, add products to place an order")
	})

	t.Run("Empty Cart", func(t *testing.T) {
		orderInput := dtos.CheckoutCartOrderInput{
			MeetupAddress:   "123 University Ave",
			MeetupDate:      meetupDate,
			MeetupTime:      meetupTime,
			AdditionalNotes: "Call when arrived",
			PaymentMethod:   models.Cash,
		}
		inputJSON, _ := json.Marshal(orderInput)

		c, w := tests.CreateTestContext("POST", "/api/checkout/cart", inputJSON)
		c.Request.Header.Set("Authorization", token)

		handlers.CheckoutCartOrder(c)
		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "Your cart is empty")
	})

	t.Run("Successful Order", func(t *testing.T) {
		cartItem := &models.CartProduct{
			UserUID:    user.Uid,
			ProductPID: product.Pid,
			Quantity:   2,
			IsDelete:   false,
		}
		db.Create(cartItem)

		orderInput := dtos.CheckoutCartOrderInput{
			MeetupAddress:   "123 University Ave",
			MeetupDate:      meetupDate,
			MeetupTime:      meetupTime,
			AdditionalNotes: "Call when arrived",
			PaymentMethod:   models.Cash,
		}
		inputJSON, _ := json.Marshal(orderInput)

		c, w := tests.CreateTestContext("POST", "/api/checkout/cart", inputJSON)
		c.Request.Header.Set("Authorization", token)

		handlers.CheckoutCartOrder(c)
		require.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		require.NotEmpty(t, response["orderId"])
	})
}

func TestCheckoutCartProduct(t *testing.T) {
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

	// Create test token
	token, _ := auth.GenerateToken(user.Uid)

	// Prepare test product
	product := &models.Product{
		ID:          1,
		Pid:         "product-pid",
		UserUID:     "seller-uid",
		Name:        "Test Product",
		Description: "Test Description",
		Price:       99.99,
		Category:    models.Electronics,
		PostedBy:    *user,
		Quantity:    10,
	}
	db.Create(product)

	meetupDate := time.Now().Format("2006-01-02")
	meetupTime := "14:00"
	priceProposal := 90

	t.Run("Invalidate Input Format", func(t *testing.T) {
		c, w := tests.CreateTestContext("POST", "/api/checkout/product", []byte(`{"invalid":"json"}`))
		c.Request.Header.Set("Authorization", token)

		handlers.CheckoutCartProduct(c)
		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "Product ID is required")
	})

	t.Run("Product Not Found", func(t *testing.T) {
		orderInput := dtos.CheckoutProductOrderInput{
			MeetupAddress:   "123 University Ave",
			MeetupDate:      meetupDate,
			MeetupTime:      meetupTime,
			AdditionalNotes: "Call when arrived",
			ProductId:       "non-existent-pid",
			Quantity:        1,
			PaymentMethod:   models.Cash,
			PriceProposal:   &priceProposal,
		}
		inputJSON, _ := json.Marshal(orderInput)

		c, w := tests.CreateTestContext("POST", "/api/checkout/product", inputJSON)
		c.Request.Header.Set("Authorization", token)

		handlers.CheckoutCartProduct(c)
		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "Product not found")
	})

	t.Run("Successful Order", func(t *testing.T) {
		orderInput := dtos.CheckoutProductOrderInput{
			MeetupAddress:   "123 University Ave",
			MeetupDate:      meetupDate,
			MeetupTime:      meetupTime,
			AdditionalNotes: "Call when arrived",
			ProductId:       product.Pid,
			Quantity:        2,
			PaymentMethod:   models.Cash,
			PriceProposal:   &priceProposal,
		}
		inputJSON, _ := json.Marshal(orderInput)

		c, w := tests.CreateTestContext("POST", "/api/checkout/product", inputJSON)
		c.Request.Header.Set("Authorization", token)

		handlers.CheckoutCartProduct(c)
		require.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		// Verify order ID is returned
		require.NotEmpty(t, response["orderId"])
	})
}
