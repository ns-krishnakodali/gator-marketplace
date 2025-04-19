package services_test

import (
	"fmt"
	"marketplace-be/models"
	"marketplace-be/services"
	"marketplace-be/tests"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAddToCartService(t *testing.T) {
	db := tests.SetupTestDB(t)

	// Create test product
	product := &models.Product{
		Pid:      "pid-abc",
		Name:     "Test Product",
		Quantity: 10,
		Price:    10.0,
	}
	db.Create(product)

	userUID := "uid-123"

	t.Run("Add to cart Success", func(t *testing.T) {
		err := services.AddToCartService(userUID, "pid-abc", 3)
		require.NoError(t, err)

		var cartItem models.CartProduct
		db.Where("user_uid = ? AND product_p_id = ?", userUID, "pid-abc").First(&cartItem)
		require.Equal(t, 3, cartItem.Quantity)

		var updatedProd models.Product
		db.Where("pid = ?", "pid-abc").First(&updatedProd)
		require.Equal(t, 10, updatedProd.Quantity) // No change in stock
	})

	t.Run("Product Already Added", func(t *testing.T) {
		// Create test product
		product := &models.Product{
			Pid:      "pid-xyz",
			Name:     "Test Product",
			Quantity: 5,
			Price:    5.0,
		}
		db.Create(product)

		userUID := "uid-xyz"

		cartItem := &models.CartProduct{
			UserUID:    userUID,
			ProductPID: "pid-xyz",
			Quantity:   2,
		}
		db.Create(cartItem)

		err := services.AddToCartService(userUID, "pid-xyz", 3)
		require.Error(t, err)
		require.Equal(t, services.ErrProductAlreadyAdded, err)
	})
}

func TestGetCartProductsService(t *testing.T) {
	db := tests.SetupTestDB(t)

	t.Run("Empty Cart", func(t *testing.T) {
		response, err := services.GetCartProductsService("empty_user")
		require.NoError(t, err)
		require.Empty(t, response.CartProducts)
		require.Equal(t, float64(0), response.ProductsTotal)
		require.Equal(t, services.HandlingFee, response.HandlingFee)
		require.Equal(t, services.HandlingFee, response.TotalCost)
	})

	t.Run("Single Product", func(t *testing.T) {
		product := &models.Product{
			Pid:      "pid1",
			Name:     "Product 1",
			Quantity: 10,
			Price:    25.5,
		}
		db.Create(product)

		image := &models.ProductImage{
			Pid:    "pid1",
			Url:    "http://example.com/image1.jpg",
			IsMain: true,
		}
		db.Create(image)

		cartItem := &models.CartProduct{
			UserUID:    "user1",
			ProductPID: "pid1",
			Quantity:   2,
		}
		db.Create(cartItem)

		response, err := services.GetCartProductsService("user1")
		require.NoError(t, err)
		require.Len(t, response.CartProducts, 1)
		require.Equal(t, "pid1", response.CartProducts[0].PID)
		require.Equal(t, "Product 1", response.CartProducts[0].ProductName)
		require.Equal(t, 2, response.CartProducts[0].AddedQuantity)
		require.Equal(t, 10, response.CartProducts[0].MaxQuantity)
		require.Equal(t, 25.5, response.CartProducts[0].ProductPrice)
		require.Equal(t, "http://example.com/image1.jpg", response.CartProducts[0].PrimaryImage)

		require.Equal(t, 25.5*2, response.ProductsTotal)
		require.Equal(t, services.HandlingFee, response.HandlingFee)
		require.Equal(t, 25.5*2+services.HandlingFee, response.TotalCost)
	})

	t.Run("Multiple Products", func(t *testing.T) {
		products := []*models.Product{
			{Pid: "multi1", Name: "Multi 1", Quantity: 5, Price: 10.0},
			{Pid: "multi2", Name: "Multi 2", Quantity: 8, Price: 15.0},
		}
		for _, p := range products {
			db.Create(p)
		}

		images := []*models.ProductImage{
			{Pid: "multi1", Url: "http://example.com/multi1.jpg", IsMain: true},
			{Pid: "multi2", Url: "http://example.com/multi2.jpg", IsMain: true},
		}
		for _, img := range images {
			db.Create(img)
		}

		cartItems := []*models.CartProduct{
			{UserUID: "multi_user", ProductPID: "multi1", Quantity: 2},
			{UserUID: "multi_user", ProductPID: "multi2", Quantity: 3},
		}
		for _, item := range cartItems {
			db.Create(item)
		}

		response, err := services.GetCartProductsService("multi_user")
		require.NoError(t, err)
		require.Len(t, response.CartProducts, 2)

		expectedTotal := 10.0*2 + 15.0*3

		require.Equal(t, expectedTotal, response.ProductsTotal)
		require.Equal(t, services.HandlingFee, response.HandlingFee)
		require.Equal(t, expectedTotal+services.HandlingFee, response.TotalCost)
	})

	t.Run("Product Without Image", func(t *testing.T) {
		product := &models.Product{
			Pid:      "no_img",
			Name:     "No Image",
			Quantity: 10,
			Price:    5.0,
		}
		db.Create(product)

		cartItem := &models.CartProduct{
			UserUID:    "img_test_user",
			ProductPID: "no_img",
			Quantity:   1,
		}
		db.Create(cartItem)

		response, err := services.GetCartProductsService("img_test_user")
		require.NoError(t, err)
		require.Len(t, response.CartProducts, 1)
		require.Equal(t, "", response.CartProducts[0].PrimaryImage)
	})
}

func TestGetCartProductsCountService(t *testing.T) {
	db := tests.SetupTestDB(t)

	t.Run("Empty Cart", func(t *testing.T) {
		count, err := services.GetCartProductsCountService("empty_count_user")
		require.NoError(t, err)
		require.Equal(t, "0", count)
	})

	t.Run("Few Items", func(t *testing.T) {
		products := []*models.Product{
			{Pid: "count1", Name: "Count 1", Quantity: 10, Price: 10.0},
			{Pid: "count2", Name: "Count 2", Quantity: 10, Price: 20.0},
			{Pid: "count3", Name: "Count 3", Quantity: 10, Price: 30.0},
		}
		for _, p := range products {
			db.Create(p)
		}

		cartItems := []*models.CartProduct{
			{UserUID: "count_user", ProductPID: "count1", Quantity: 1},
			{UserUID: "count_user", ProductPID: "count2", Quantity: 1},
			{UserUID: "count_user", ProductPID: "count3", Quantity: 1},
		}
		for _, item := range cartItems {
			db.Create(item)
		}

		count, err := services.GetCartProductsCountService("count_user")
		require.NoError(t, err)
		require.Equal(t, "3", count)
	})

	t.Run("Many Items (>10)", func(t *testing.T) {
		for i := 1; i <= 11; i++ {
			pid := fmt.Sprintf("many%d", i)
			product := &models.Product{
				Pid:      pid,
				Name:     fmt.Sprintf("Many %d", i),
				Quantity: 10,
				Price:    float64(i) * 5.0,
			}
			db.Create(product)

			cartItem := &models.CartProduct{
				UserUID:    "many_user",
				ProductPID: pid,
				Quantity:   1,
			}
			db.Create(cartItem)
		}

		count, err := services.GetCartProductsCountService("many_user")
		require.NoError(t, err)
		require.Equal(t, "10+", count)
	})
}

func TestUpdateCartItemService(t *testing.T) {
	db := tests.SetupTestDB(t)

	t.Run("Increase Qty Success", func(t *testing.T) {
		p := &models.Product{Pid: "p1", Name: "P1", Quantity: 10, Price: 5.0}
		db.Create(p)

		cartItem := &models.CartProduct{
			UserUID:    "u1",
			ProductPID: "p1",
			Quantity:   3,
		}
		db.Create(cartItem)

		updated, err := services.UpdateCartProductService(cartItem.ProductPID, 8, cartItem.UserUID)
		require.NoError(t, err)
		require.Equal(t, float64(41), updated.TotalCost)

		var updatedCart models.CartProduct
		db.Where("user_uid = ? AND product_p_id = ?", "u1", "p1").First(&updatedCart)
		require.Equal(t, 8, updatedCart.Quantity)
	})

	t.Run("Decrease Qty Success", func(t *testing.T) {
		p := &models.Product{Pid: "p2", Name: "P2", Quantity: 10, Price: 7.0}
		db.Create(p)

		cartItem := &models.CartProduct{UserUID: "u2", ProductPID: "p2", Quantity: 5}
		db.Create(cartItem)

		updated, err := services.UpdateCartProductService(cartItem.ProductPID, 2, cartItem.UserUID)
		require.NoError(t, err)
		require.Equal(t, float64(15), updated.TotalCost)

		var updatedCart models.CartProduct
		db.Where("user_uid = ? AND product_p_id = ?", "u2", "p2").First(&updatedCart)
		require.Equal(t, 2, updatedCart.Quantity)
	})

	t.Run("Quantity Too High", func(t *testing.T) {
		p := &models.Product{Pid: "p3", Name: "P3", Quantity: 5, Price: 10.0}
		db.Create(p)

		cartItem := &models.CartProduct{UserUID: "u3", ProductPID: "p3", Quantity: 3}
		db.Create(cartItem)

		_, err := services.UpdateCartProductService(cartItem.ProductPID, 10, cartItem.UserUID)
		require.ErrorIs(t, err, services.ErrInsufficientProductQuantity)
	})

	t.Run("Product Not Found", func(t *testing.T) {
		_, err := services.UpdateCartProductService("nonexistent", 2, "")
		require.ErrorIs(t, err, services.ErrCartProductNotFound)
	})
}

func TestRemoveCartItemService(t *testing.T) {
	// Setup test DB
	db := tests.SetupTestDB(t)

	t.Run("Remove from cart Success", func(t *testing.T) {
		db.Create(&models.Product{Pid: "px", Name: "PX", Quantity: 10})

		cart := &models.CartProduct{UserUID: "uA", ProductPID: "px", Quantity: 3}
		db.Create(cart)

		_, err := services.RemoveCartProductService("px", "uA")
		require.NoError(t, err)

		var count int64
		db.Model(&models.CartProduct{}).Where("user_uid = ? AND product_p_id = ?", "uA", "px").Count(&count)
		require.Equal(t, int64(0), count)
	})
}

func TestClearCartService(t *testing.T) {
	// Setup test DB
	db := tests.SetupTestDB(t)

	t.Run("Clear cart Success", func(t *testing.T) {
		db.Create(&models.Product{Pid: "pA", Name: "pA", Quantity: 5})
		db.Create(&models.Product{Pid: "pB", Name: "pB", Quantity: 8})

		db.Create(&models.CartProduct{UserUID: "uA", ProductPID: "pA", Quantity: 2})
		db.Create(&models.CartProduct{UserUID: "uA", ProductPID: "pB", Quantity: 3})
		db.Create(&models.CartProduct{UserUID: "uZ", ProductPID: "pA", Quantity: 1})

		err := services.ClearCartService("uA")
		require.NoError(t, err)

		var all []models.CartProduct
		db.Find(&all).Where("is_delete = ?", true)
		require.Len(t, all, 3)
	})
}
