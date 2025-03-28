package handlers_test

import (
	"encoding/json"
	"net/http"
	"strconv"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"

	"marketplace-be/handlers"
	"marketplace-be/models"
	"marketplace-be/test_utils"
)

func TestAddToCart_Handler_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	// Create product
	db.Create(&models.Product{
		Pid:      "pid-abc",
		Name:     "Test Product",
		Quantity: 10,
	})

	// Prepare request
	body := `{"product_pid":"pid-abc","quantity":2}`
	c, w := test_utils.CreateTestContext("POST", "/api/cart", []byte(body))
	test_utils.SetUserContext(c, "test-user-uid")

	handlers.AddToCart(c)
	require.Equal(t, http.StatusCreated, w.Code)

	var item models.CartItem
	err := json.Unmarshal(w.Body.Bytes(), &item)
	require.NoError(t, err)
	require.Equal(t, "pid-abc", item.ProductPID)
	require.Equal(t, 2, item.Quantity)

	// Check product quantity is now 8
	var p models.Product
	db.Where("pid = ?", "pid-abc").First(&p)
	require.Equal(t, 8, p.Quantity)
}

func TestAddToCart_Handler_ProductNotFound(t *testing.T) {
	db := test_utils.SetupTestDB(t)
	_ = db

	body := `{"product_pid":"no-such-pid","quantity":1}`
	c, w := test_utils.CreateTestContext("POST", "/api/cart", []byte(body))
	test_utils.SetUserContext(c, "test-user-uid")

	handlers.AddToCart(c)
	require.Equal(t, http.StatusNotFound, w.Code)

	var resp map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	require.Equal(t, "Product not found", resp["error"])
}

func TestGetCartItems_Handler_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	// Insert some items
	db.Create(&models.CartItem{UserUID: "test-user-uid", ProductPID: "p1", Quantity: 2})
	db.Create(&models.CartItem{UserUID: "test-user-uid", ProductPID: "p2", Quantity: 1})
	db.Create(&models.CartItem{UserUID: "other-user", ProductPID: "pX", Quantity: 3})

	c, w := test_utils.CreateTestContext("GET", "/api/cart", nil)
	test_utils.SetUserContext(c, "test-user-uid")

	handlers.GetCartItems(c)
	require.Equal(t, http.StatusOK, w.Code)

	var items []models.CartItem
	err := json.Unmarshal(w.Body.Bytes(), &items)
	require.NoError(t, err)
	require.Len(t, items, 2) // only items for "test-user-uid"
}

func TestUpdateCartItem_Handler_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	// Create product with quantity 10
	db.Create(&models.Product{Pid: "pid-upd", Name: "P Upd", Quantity: 10})

	// Create cart item with quantity=3
	cart := models.CartItem{UserUID: "test-user-uid", ProductPID: "pid-upd", Quantity: 3}
	db.Create(&cart)

	body := `{"quantity":5}` // request to set quantity=5
	cartID := strconv.Itoa(cart.ID)

	c, w := test_utils.CreateTestContext("PUT", "/api/cart/"+cartID, []byte(body))
	c.Params = gin.Params{{Key: "cartItemID", Value: cartID}}
	test_utils.SetUserContext(c, "test-user-uid")

	handlers.UpdateCartItem(c)
	require.Equal(t, http.StatusOK, w.Code)

	var updated models.CartItem
	err := json.Unmarshal(w.Body.Bytes(), &updated)
	require.NoError(t, err)
	require.Equal(t, 5, updated.Quantity)

	// Product stock should be: initial=10; difference=2; final=8
	var prod models.Product
	db.Where("pid = ?", "pid-upd").First(&prod)
	require.Equal(t, 8, prod.Quantity)
}

func TestRemoveCartItem_Handler_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	db.Create(&models.Product{Pid: "pid-del", Quantity: 10})
	cart := models.CartItem{UserUID: "test-user-uid", ProductPID: "pid-del", Quantity: 3}
	db.Create(&cart)

	cartID := strconv.Itoa(cart.ID)
	c, w := test_utils.CreateTestContext("DELETE", "/api/cart/"+cartID, nil)
	c.Params = gin.Params{{Key: "cartItemID", Value: cartID}}
	test_utils.SetUserContext(c, "test-user-uid")

	handlers.RemoveCartItem(c)
	require.Equal(t, http.StatusOK, w.Code)

	var resp map[string]string
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	require.Equal(t, "Item removed", resp["message"])

	// Confirm cart item is deleted
	var count int64
	db.Model(&models.CartItem{}).Count(&count)
	require.EqualValues(t, 0, count)

	// Product stock should have been restored from 10 => 13
	var product models.Product
	db.Where("pid = ?", "pid-del").First(&product)
	require.Equal(t, 13, product.Quantity)
}

func TestClearCart_Handler_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	db.Create(&models.Product{Pid: "pA", Quantity: 5})
	db.Create(&models.Product{Pid: "pB", Quantity: 8})

	db.Create(&models.CartItem{UserUID: "test-user-uid", ProductPID: "pA", Quantity: 2})
	db.Create(&models.CartItem{UserUID: "test-user-uid", ProductPID: "pB", Quantity: 3})
	db.Create(&models.CartItem{UserUID: "other-user", ProductPID: "pA", Quantity: 1})

	c, w := test_utils.CreateTestContext("DELETE", "/api/cart", nil)
	test_utils.SetUserContext(c, "test-user-uid")

	handlers.ClearCart(c)
	require.Equal(t, http.StatusOK, w.Code)

	var resp map[string]string
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	require.Equal(t, "Cart cleared", resp["message"])

	// confirm only "other-user" item remains
	var items []models.CartItem
	db.Find(&items)
	require.Len(t, items, 1)
	require.Equal(t, "other-user", items[0].UserUID)

	// check product quantities are restored
	var pA, pB models.Product
	db.Where("pid = ?", "pA").First(&pA)
	db.Where("pid = ?", "pB").First(&pB)

	// pA was 5, user had 2 => new total 7
	require.Equal(t, 7, pA.Quantity)
	// pB was 8, user had 3 => new total 11
	require.Equal(t, 11, pB.Quantity)
}

