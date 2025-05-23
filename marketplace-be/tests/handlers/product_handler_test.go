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
	gin.SetMode(gin.TestMode)
}

func TestGetProducts(t *testing.T) {
	db := tests.SetupTestDB(t)

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

	token, _ := auth.GenerateToken(user.Uid)

	// Insert test products
	db.Create(&models.Product{Pid: "pid-1", UserUID: user.Uid, Name: "P1", Category: models.Electronics, Price: 100, PopularityScore: 10})
	db.Create(&models.Product{Pid: "pid-2", UserUID: user.Uid, Name: "P2", Category: models.Books, Price: 50, PopularityScore: 20})
	db.Create(&models.Product{Pid: "pid-3", UserUID: user.Uid, Name: "Book B", Category: models.Books, Price: 30, PopularityScore: 5})

	t.Run("Default Params", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/products", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetProducts(c)

		require.Equal(t, http.StatusOK, w.Code)

		var resp dtos.GetProductsResponse
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		require.Len(t, resp.Products, 3) // All 3 products
		require.EqualValues(t, 1, resp.Page)
		require.EqualValues(t, 10, resp.PageSize)
		require.EqualValues(t, 3, resp.TotalItems)

		// Verify product details structure
		product := resp.Products[0]
		require.NotEmpty(t, product.Pid)
		require.NotEmpty(t, product.Name)
		require.NotEmpty(t, product.Price)
		// Image might be empty since we didn't create test images
	})

	t.Run("With Pagination", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/products?page=1&pageSize=2", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetProducts(c)

		require.Equal(t, http.StatusOK, w.Code)

		var resp dtos.GetProductsResponse
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		require.Len(t, resp.Products, 2) // Only 2 per page
		require.EqualValues(t, 1, resp.Page)
		require.EqualValues(t, 2, resp.PageSize)
		require.EqualValues(t, 3, resp.TotalItems)
		require.EqualValues(t, 2, resp.TotalPages) // 3 items with pageSize=2 = 2 pages
	})

	t.Run("Filter By Category", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/products?categories=Books", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetProducts(c)

		require.Equal(t, http.StatusOK, w.Code)

		var resp dtos.GetProductsResponse
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		require.Len(t, resp.Products, 2) // Only the 2 books

		// Verify all returned products are in the Books category
		for _, product := range resp.Products {
			require.Contains(t, []string{"P2", "Book B"}, product.Name)
		}
	})

	t.Run("Sort By Price", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/products?sort=price_desc", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetProducts(c)

		require.Equal(t, http.StatusOK, w.Code)

		var resp dtos.GetProductsResponse
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		require.Len(t, resp.Products, 3)

		// Should be sorted by price descending: P1(100) > P2(50) > Book B(30)
		require.Equal(t, "P1", resp.Products[0].Name)
		require.Equal(t, "P2", resp.Products[1].Name)
		require.Equal(t, "Book B", resp.Products[2].Name)

		// Double check actual price values
		require.EqualValues(t, 100, resp.Products[0].Price)
		require.EqualValues(t, 50, resp.Products[1].Price)
		require.EqualValues(t, 30, resp.Products[2].Price)
	})

	t.Run("Filter And Sort Combined", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/products?categories=Books&sort=price_desc", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetProducts(c)

		require.Equal(t, http.StatusOK, w.Code)

		var resp dtos.GetProductsResponse
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		require.Len(t, resp.Products, 2) // Only the 2 books

		// Books sorted by price: P2(50) > Book B(30)
		require.Equal(t, "P2", resp.Products[0].Name)
		require.Equal(t, "Book B", resp.Products[1].Name)

		// Verify prices
		require.EqualValues(t, 50, resp.Products[0].Price)
		require.EqualValues(t, 30, resp.Products[1].Price)
	})

	t.Run("Invalid Category", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/products?categories=InvalidCategory", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetProducts(c)

		require.Equal(t, http.StatusBadRequest, w.Code)

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		// Verify error message contains information about invalid category
		require.Contains(t, resp["error"].(string), "invalid categories")
	})
}

func TestGetProductByPID(t *testing.T) {
	db := tests.SetupTestDB(t)

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

	token, _ := auth.GenerateToken(user.Uid)

	db.Create(&models.Product{
		Pid:         "pid-123",
		Name:        "Some Product",
		Description: "Desc",
		Category:    models.Electronics,
		Price:       999.99,
	})
	db.Create(&models.ProductImage{
		Pid:      "pid-123",
		MimeType: "image/png",
		Url:      "http://example.com/img.png",
		IsMain:   true,
	})

	t.Run("Get Product details Success", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/products/pid-123", nil)
		c.Params = gin.Params{{Key: "pid", Value: "pid-123"}}
		c.Request.Header.Set("Authorization", token)

		handlers.GetProductByPID(c)

		require.Equal(t, http.StatusOK, w.Code)

		var p dtos.ProductResponse
		err := json.Unmarshal(w.Body.Bytes(), &p)
		require.NoError(t, err)
		require.Equal(t, "pid-123", p.Pid)
		require.Len(t, p.Images, 1)
		require.Equal(t, "http://example.com/img.png", p.Images[0].Url)
	})

	t.Run("Product Not Found", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/products/non-existent", nil)
		c.Params = gin.Params{{Key: "pid", Value: "non-existent"}}
		c.Request.Header.Set("Authorization", token)

		handlers.GetProductByPID(c)

		require.Equal(t, http.StatusNotFound, w.Code)
		require.Contains(t, w.Body.String(), "error")
	})
}

func TestDeleteProduct(t *testing.T) {
	db := tests.SetupTestDB(t)

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

	token, _ := auth.GenerateToken(user.Uid)

	db.Create(&models.Product{Pid: "pid-del", Name: "ToDelete"})
	db.Create(&models.ProductImage{Pid: "pid-del", Url: "http://example.com/img.png"})

	t.Run("Delete Product Success", func(t *testing.T) {
		c, w := tests.CreateTestContext("DELETE", "/api/products/pid-del", nil)
		c.Request.Header.Set("Authorization", token)
		c.Params = gin.Params{{Key: "pid", Value: "pid-del"}}

		handlers.DeleteProduct(c)
		require.Equal(t, http.StatusOK, w.Code)

		var resp map[string]string
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		require.Equal(t, "Product deleted successfully", resp["message"])

		// Confirm it's deleted
		var p models.Product
		err := db.Where("pid = ?", "pid-del").First(&p).Error
		require.Error(t, err) // should be not found
	})

	t.Run("Product Not Found", func(t *testing.T) {
		c, w := tests.CreateTestContext("DELETE", "/api/products/non-existent", nil)
		c.Request.Header.Set("Authorization", token)
		c.Params = gin.Params{{Key: "pid", Value: "non-existent"}}

		handlers.DeleteProduct(c)
		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "error")
	})
}
