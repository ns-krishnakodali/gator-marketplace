package services_test

import (
	"testing"

	"marketplace-be/models"
	"marketplace-be/services"
	"marketplace-be/test_utils"

	"github.com/stretchr/testify/require"
)

func TestAddToCartService_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	// Create product with quantity 10
	product := models.Product{
		Pid:      "pid-abc",
		Name:     "Test Product",
		Quantity: 10,
		Price:    10.0,
	}
	db.Create(&product)

	userUID := "uid-123"

	// 1) Add 3 to cart
	item, err := services.AddToCartService(userUID, "pid-abc", 3)
	require.NoError(t, err)
	require.NotNil(t, item)
	require.Equal(t, 3, item.Quantity)

	// Check product quantity is now 7
	var updatedProd models.Product
	db.Where("pid = ?", "pid-abc").First(&updatedProd)
	require.Equal(t, 7, updatedProd.Quantity)

	// 2) Add 2 more => total cart quantity = 5, product = 5 left
	item2, err2 := services.AddToCartService(userUID, "pid-abc", 2)
	require.NoError(t, err2)
	require.NotNil(t, item2)
	require.Equal(t, 5, item2.Quantity)

	// Confirm product quantity is 5
	db.Where("pid = ?", "pid-abc").First(&updatedProd)
	require.Equal(t, 5, updatedProd.Quantity)
}

func TestAddToCartService_OutOfStock(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	// Product has quantity=2
	db.Create(&models.Product{
		Pid:      "pid-xyz",
		Name:     "Test Product",
		Quantity: 2,
		Price:    5.0,
	})

	userUID := "uid-xyz"

	// Try to add 5, but only 2 in stock
	_, err := services.AddToCartService(userUID, "pid-xyz", 5)
	require.Error(t, err)
	require.Equal(t, services.ErrInsufficientProductQuantity, err)
}

func TestUpdateCartItemService_IncreaseQty_Success(t *testing.T) {
    db := test_utils.SetupTestDB(t)

    // Product starts at quantity = 7.
    // We assume that 3 units were already "reserved" by the cart item
    // in a previous step (thus it's not 10).
    p := models.Product{Pid: "p1", Name: "P1", Quantity: 7}
    db.Create(&p)

    // Cart item with quantity 3 (already in cart).
    cartItem := models.CartItem{
        UserUID:    "u1",
        ProductPID: "p1",
        Quantity:   3,
    }
    db.Create(&cartItem)

    // Now the user updates from 3 => 8 => difference = 5
    // So the product goes from 7 => 2.
    updated, err := services.UpdateCartItemService(cartItem.ID, 8)
    require.NoError(t, err)
    require.Equal(t, 8, updated.Quantity)

    var product models.Product
    db.Where("pid = ?", "p1").First(&product)

    // Final product quantity should be 2
    require.Equal(t, 2, product.Quantity)
}

func TestUpdateCartItemService_DecreaseQty_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	p := models.Product{Pid: "p2", Name: "P2", Quantity: 10}
	db.Create(&p)

	// Start with a cart item of 5
	cartItem := models.CartItem{UserUID: "u2", ProductPID: "p2", Quantity: 5}
	db.Create(&cartItem)

	// Decrease to 2 => that means we return 3 to product stock
	updated, err := services.UpdateCartItemService(cartItem.ID, 2)
	require.NoError(t, err)
	require.Equal(t, 2, updated.Quantity)

	var product models.Product
	db.Where("pid = ?", "p2").First(&product)
	require.Equal(t, 13, product.Quantity) // 10 + (5 - 2) = 13
}

func TestRemoveCartItemService_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	// Product
	db.Create(&models.Product{Pid: "px", Name: "PX", Quantity: 10})
	// Cart item of 3
	cart := models.CartItem{UserUID: "uA", ProductPID: "px", Quantity: 3}
	db.Create(&cart)

	err := services.RemoveCartItemService(cart.ID)
	require.NoError(t, err)

	// Check product stock is restored from 10 => 13
	var product models.Product
	db.Where("pid = ?", "px").First(&product)
	require.Equal(t, 13, product.Quantity)

	// Check cart item is gone
	var count int64
	db.Model(&models.CartItem{}).Count(&count)
	require.EqualValues(t, 0, count)
}

func TestClearCartService_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	db.Create(&models.Product{Pid: "pA", Name: "pA", Quantity: 5})
	db.Create(&models.Product{Pid: "pB", Name: "pB", Quantity: 8})

	db.Create(&models.CartItem{UserUID: "uA", ProductPID: "pA", Quantity: 2})
	db.Create(&models.CartItem{UserUID: "uA", ProductPID: "pB", Quantity: 3})
	// Another user
	db.Create(&models.CartItem{UserUID: "uZ", ProductPID: "pA", Quantity: 1})

	err := services.ClearCartService("uA")
	require.NoError(t, err)

	// Check items left
	var all []models.CartItem
	db.Find(&all)
	require.Len(t, all, 1) // only user "uZ" remains

	// Stock should be restored
	var productA, productB models.Product
	db.Where("pid = ?", "pA").First(&productA)
	db.Where("pid = ?", "pB").First(&productB)

	// pA was 5, user "uA" had 2, so final should be 7
	require.Equal(t, 7, productA.Quantity)
	// pB was 8, user "uA" had 3 => final 11
	require.Equal(t, 11, productB.Quantity)
}
