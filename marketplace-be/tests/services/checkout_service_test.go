package services_test

import (
	"marketplace-be/database"
	"marketplace-be/dtos"
	"marketplace-be/models"
	"marketplace-be/services"
	"marketplace-be/tests"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestGetCheckoutCartDetailsService(t *testing.T) {
	db := tests.SetupTestDB(t)

	t.Run("Empty Cart", func(t *testing.T) {
		result, err := services.GetCheckoutCartDetailsService("empty-user")
		require.NoError(t, err)
		require.Empty(t, result.CheckoutProductDetails)
		require.Equal(t, float64(0), result.ProductsTotal)
		require.Equal(t, services.HandlingFee, result.HandlingFee)
		require.Equal(t, services.HandlingFee, result.TotalCost)
	})

	t.Run("Cart With Single Item", func(t *testing.T) {
		// Create a test product
		product := &models.Product{
			Pid:      "test-product",
			Name:     "Test Product",
			Price:    25.50,
			Quantity: 10,
		}
		db.Create(product)

		// Add the product to the user's cart
		cartItem := &models.CartProduct{
			UserUID:    "test-user",
			ProductPID: product.Pid,
			Quantity:   2,
			IsDelete:   false,
		}
		db.Create(cartItem)

		result, err := services.GetCheckoutCartDetailsService("test-user")
		require.NoError(t, err)
		require.Len(t, result.CheckoutProductDetails, 1)
		require.Equal(t, "Test Product", result.CheckoutProductDetails[0].ProductName)
		require.Equal(t, 2, result.CheckoutProductDetails[0].Quantity)
		require.Equal(t, 25.50*2, result.CheckoutProductDetails[0].ProductTotalPrice)
		require.Equal(t, 25.50*2, result.ProductsTotal)
		require.Equal(t, services.HandlingFee, result.HandlingFee)
		require.Equal(t, 25.50*2+services.HandlingFee, result.TotalCost)
	})

	t.Run("Cart With Multiple Items", func(t *testing.T) {
		// Create test products
		products := []*models.Product{
			{Pid: "multi-prod-1", Name: "Multi Product 1", Price: 10.0, Quantity: 10},
			{Pid: "multi-prod-2", Name: "Multi Product 2", Price: 15.0, Quantity: 15},
		}
		for _, p := range products {
			db.Create(p)
		}

		// Add products to cart
		cartItems := []*models.CartProduct{
			{UserUID: "multi-user", ProductPID: "multi-prod-1", Quantity: 2, IsDelete: false},
			{UserUID: "multi-user", ProductPID: "multi-prod-2", Quantity: 3, IsDelete: false},
		}
		for _, item := range cartItems {
			db.Create(item)
		}

		result, err := services.GetCheckoutCartDetailsService("multi-user")
		require.NoError(t, err)
		require.Len(t, result.CheckoutProductDetails, 2)

		// Calculate expected total
		expectedTotal := 10.0*2 + 15.0*3
		require.Equal(t, expectedTotal, result.ProductsTotal)
		require.Equal(t, services.HandlingFee, result.HandlingFee)
		require.Equal(t, expectedTotal+services.HandlingFee, result.TotalCost)
	})

	t.Run("Handles DB Error", func(t *testing.T) {
		// Force DB to close to simulate error
		sqlDB, _ := database.DB.DB()
		sqlDB.Close()

		_, err := services.GetCheckoutCartDetailsService("any-user")
		require.Error(t, err)

		// Reconnect for other tests
		tests.SetupTestDB(t)
	})
}

func TestGetCheckoutProductDetailsService(t *testing.T) {
	db := tests.SetupTestDB(t)

	t.Run("Valid Product and Quantity", func(t *testing.T) {
		// Create a test product
		product := &models.Product{
			Pid:      "checkout-prod",
			Name:     "Checkout Product",
			Price:    50.25,
			Quantity: 10,
		}
		db.Create(product)

		result, err := services.GetCheckoutProductDetailsService(product.Pid, 3)
		require.NoError(t, err)
		require.Len(t, result.CheckoutProductDetails, 1)
		require.Equal(t, "Checkout Product", result.CheckoutProductDetails[0].ProductName)
		require.Equal(t, 3, result.CheckoutProductDetails[0].Quantity)
		require.Equal(t, 50.25*3, result.CheckoutProductDetails[0].ProductTotalPrice)
		require.Equal(t, 50.25*3, result.ProductsTotal)
		require.Equal(t, services.HandlingFee, result.HandlingFee)
		require.Equal(t, 50.25*3+services.HandlingFee, result.TotalCost)
	})

	t.Run("Product Not Found", func(t *testing.T) {
		_, err := services.GetCheckoutProductDetailsService("non-existent-product", 1)
		require.Error(t, err)
		require.Equal(t, services.ErrProductNotFound, err)
	})

	t.Run("Insufficient Quantity", func(t *testing.T) {
		// Create a test product with limited stock
		product := &models.Product{
			Pid:      "limited-stock",
			Name:     "Limited Stock Product",
			Price:    30.00,
			Quantity: 5,
		}
		db.Create(product)

		_, err := services.GetCheckoutProductDetailsService(product.Pid, 10)
		require.Error(t, err)
		require.Equal(t, services.ErrInsufficientProductQuantity, err)
	})
}

func TestCheckoutCartOrderService(t *testing.T) {
	db := tests.SetupTestDB(t)

	t.Run("Empty Cart", func(t *testing.T) {
		input := &dtos.CheckoutCartOrderInput{
			MeetupAddress:   "Test Address",
			MeetupDate:      "2023-11-30",
			MeetupTime:      "14:00",
			AdditionalNotes: "Test notes",
			PaymentMethod:   models.Cash,
		}

		_, err := services.CheckoutCartOrderService(input, "empty-cart-user")
		require.Error(t, err)
		require.Equal(t, services.ErrEmptyCart, err)
	})

	t.Run("Successful Order Creation", func(t *testing.T) {
		user := &models.User{
			Uid:          "order-user-uid",
			Email:        "order@test.com",
			DisplayName:  "Order Tester",
			Name:         "Order Test User",
			PasswordHash: "hash",
		}
		db.Create(user)

		// Create a test product
		product := &models.Product{
			Pid:      "order-test-product",
			UserUID:  "seller-user-uid",
			Name:     "Order Test Product",
			Price:    75.50,
			Quantity: 20,
		}
		db.Create(product)

		cartItem := &models.CartProduct{
			UserUID:    user.Uid,
			ProductPID: product.Pid,
			Quantity:   2,
			IsDelete:   false,
		}
		db.Create(cartItem)

		input := &dtos.CheckoutCartOrderInput{
			MeetupAddress:   "123 Campus Ave",
			MeetupDate:      time.Now().Format("2006-01-02"),
			MeetupTime:      "15:30",
			AdditionalNotes: "Call me when arrived",
			PaymentMethod:   models.Cash,
		}

		orderID, err := services.CheckoutCartOrderService(input, user.Uid)
		require.NoError(t, err)
		require.NotEmpty(t, orderID)

		// Verify order created in DB
		var order models.Order
		result := db.Where("order_uid = ?", orderID).First(&order)
		require.NoError(t, result.Error)
		require.Equal(t, user.Uid, order.UserUID)
		require.Equal(t, input.MeetupAddress, order.MeetupLocation)
		require.Equal(t, input.MeetupDate, order.MeetupDate)
		require.Equal(t, input.MeetupTime, order.MeetupTime)
		require.Equal(t, input.AdditionalNotes, order.AdditionalNotes)
		require.Equal(t, input.PaymentMethod, order.PaymentMethod)
		require.Equal(t, models.OrderPlaced, order.OrderStatus)

		// Verify cart is cleared
		var count int64
		db.Model(&models.CartProduct{}).
			Where("user_uid = ? AND is_delete = ?", user.Uid, false).
			Count(&count)
		require.Equal(t, int64(0), count)

		// Verify products associated with order
		var products []models.Product
		db.Model(&order).Association("Products").Find(&products)
		require.Len(t, products, 1)
		require.Equal(t, product.Pid, products[0].Pid)
	})

	t.Run("Database Error Handling", func(t *testing.T) {
		// Create input but with an invalid database to trigger error
		input := &dtos.CheckoutCartOrderInput{
			MeetupAddress:   "Test Address",
			MeetupDate:      "2023-11-30",
			MeetupTime:      "14:00",
			AdditionalNotes: "Test notes",
			PaymentMethod:   models.Cash,
		}

		// Close DB connection to force error
		sqlDB, _ := database.DB.DB()
		_ = sqlDB.Close()

		_, err := services.CheckoutCartOrderService(input, "any-user")
		require.Error(t, err)

		tests.SetupTestDB(t)
	})
}

func TestCheckoutCartProductService(t *testing.T) {
	db := tests.SetupTestDB(t)

	t.Run("Product not found", func(t *testing.T) {
		priceProposal := 90
		input := &dtos.CheckoutProductOrderInput{
			MeetupAddress:   "Test Address",
			MeetupDate:      "2023-11-30",
			MeetupTime:      "14:00",
			AdditionalNotes: "Test notes",
			ProductId:       "non-existent-product",
			Quantity:        1,
			PaymentMethod:   models.Cash,
			PriceProposal:   &priceProposal,
		}

		_, err := services.CheckoutCartProductService(input, "test-user")
		require.Error(t, err)
		require.Equal(t, services.ErrProductNotFound, err)
	})

	t.Run("Insufficient product quantity", func(t *testing.T) {
		// Create a test product with limited stock
		product := &models.Product{
			Pid:      "limited-item",
			Name:     "Limited Item",
			Price:    45.75,
			Quantity: 3,
		}
		db.Create(product)

		priceProposal := 40
		input := &dtos.CheckoutProductOrderInput{
			MeetupAddress:   "Test Address",
			MeetupDate:      "2023-11-30",
			MeetupTime:      "14:00",
			AdditionalNotes: "Test notes",
			ProductId:       product.Pid,
			Quantity:        10, // More than available
			PaymentMethod:   models.Cash,
			PriceProposal:   &priceProposal,
		}

		_, err := services.CheckoutCartProductService(input, "test-user")
		require.Error(t, err)
		require.Equal(t, services.ErrInsufficientProductQuantity, err)
	})

	t.Run("Successfully place product order", func(t *testing.T) {
		user := &models.User{
			Uid:          "direct-order-user",
			Email:        "direct@test.com",
			DisplayName:  "Direct Tester",
			Name:         "Direct Test User",
			PasswordHash: "hash",
		}
		db.Create(user)

		// Create a test product
		product := &models.Product{
			Pid:      "direct-order-product",
			UserUID:  "seller-uid",
			Name:     "Direct Order Product",
			Price:    125.99,
			Quantity: 20,
		}
		db.Create(product)

		priceProposal := 115
		input := &dtos.CheckoutProductOrderInput{
			MeetupAddress:   "456 University Blvd",
			MeetupDate:      time.Now().Format("2006-01-02"),
			MeetupTime:      "16:45",
			AdditionalNotes: "Meet at the front entrance",
			ProductId:       product.Pid,
			Quantity:        1,
			PaymentMethod:   models.Cash,
			PriceProposal:   &priceProposal,
		}

		orderID, err := services.CheckoutCartProductService(input, user.Uid)
		require.NoError(t, err)
		require.NotEmpty(t, orderID)

		var order models.Order
		result := db.Where("order_uid = ?", orderID).First(&order)
		require.NoError(t, result.Error)
		require.Equal(t, user.Uid, order.UserUID)
		require.Equal(t, input.MeetupAddress, order.MeetupLocation)
		require.Equal(t, input.MeetupDate, order.MeetupDate)
		require.Equal(t, input.MeetupTime, order.MeetupTime)
		require.Equal(t, input.AdditionalNotes, order.AdditionalNotes)
		require.Equal(t, input.PaymentMethod, order.PaymentMethod)
		require.Equal(t, *input.PriceProposal, order.PriceProposal) // Fixed: Use int type instead of float64
		require.Equal(t, models.OrderPlaced, order.OrderStatus)

		var products []models.Product
		db.Model(&order).Association("Products").Find(&products)
		require.Len(t, products, 1)
		require.Equal(t, product.Pid, products[0].Pid)
	})
}
