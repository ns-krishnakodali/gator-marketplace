package services_test

import (
	"marketplace-be/models"
	"marketplace-be/services"
	"marketplace-be/test_utils"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAddToCartService(t *testing.T) {
	db := test_utils.SetupTestDB(t)

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

func TestUpdateCartItemService(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	t.Run("Increase Qty Success", func(t *testing.T) {
		p := &models.Product{Pid: "p1", Name: "P1", Quantity: 10, Price: 5.0}
		db.Create(p)

		cartItem := &models.CartProduct{
			UserUID:    "u1",
			ProductPID: "p1",
			Quantity:   3,
		}
		db.Create(cartItem)

		updated, err := services.UpdateCartItemService(cartItem.ProductPID, 8)
		require.NoError(t, err)
		require.Equal(t, float64(45), updated.TotalCost)

		var updatedCart models.CartProduct
		db.Where("user_uid = ? AND product_p_id = ?", "u1", "p1").First(&updatedCart)
		require.Equal(t, 8, updatedCart.Quantity)
	})

	t.Run("Decrease Qty Success", func(t *testing.T) {
		p := &models.Product{Pid: "p2", Name: "P2", Quantity: 10, Price: 7.0}
		db.Create(p)

		cartItem := &models.CartProduct{UserUID: "u2", ProductPID: "p2", Quantity: 5}
		db.Create(cartItem)

		updated, err := services.UpdateCartItemService(cartItem.ProductPID, 2)
		require.NoError(t, err)
		require.Equal(t, float64(19), updated.TotalCost)

		var updatedCart models.CartProduct
		db.Where("user_uid = ? AND product_p_id = ?", "u2", "p2").First(&updatedCart)
		require.Equal(t, 2, updatedCart.Quantity)
	})

	t.Run("Quantity Too High", func(t *testing.T) {
		p := &models.Product{Pid: "p3", Name: "P3", Quantity: 5, Price: 10.0}
		db.Create(p)

		cartItem := &models.CartProduct{UserUID: "u3", ProductPID: "p3", Quantity: 3}
		db.Create(cartItem)

		_, err := services.UpdateCartItemService(cartItem.ProductPID, 10)
		require.ErrorIs(t, err, services.ErrInsufficientProductQuantity)
	})

	t.Run("Product Not Found", func(t *testing.T) {
		_, err := services.UpdateCartItemService("nonexistent", 2)
		require.ErrorIs(t, err, services.ErrCartItemNotFound)
	})
}

func TestRemoveCartItemService(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	t.Run("Remove from cart Success", func(t *testing.T) {
		db.Create(&models.Product{Pid: "px", Name: "PX", Quantity: 10})

		cart := &models.CartProduct{UserUID: "uA", ProductPID: "px", Quantity: 3}
		db.Create(cart)

		err := services.RemoveCartItemService("px", "uA")
		require.NoError(t, err)

		var count int64
		db.Model(&models.CartProduct{}).Where("user_uid = ? AND product_p_id = ?", "uA", "px").Count(&count)
		require.Equal(t, int64(0), count)
	})
}

func TestClearCartService(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	t.Run("Clear cart Success", func(t *testing.T) {
		db.Create(&models.Product{Pid: "pA", Name: "pA", Quantity: 5})
		db.Create(&models.Product{Pid: "pB", Name: "pB", Quantity: 8})

		db.Create(&models.CartProduct{UserUID: "uA", ProductPID: "pA", Quantity: 2})
		db.Create(&models.CartProduct{UserUID: "uA", ProductPID: "pB", Quantity: 3})
		db.Create(&models.CartProduct{UserUID: "uZ", ProductPID: "pA", Quantity: 1})

		err := services.ClearCartService("uA")
		require.NoError(t, err)

		var all []models.CartProduct
		db.Find(&all)
		require.Len(t, all, 1)
	})
}
