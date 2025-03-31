package handlers_test

import (
	"encoding/json"
	"marketplace-be/auth"
	"marketplace-be/handlers"
	"marketplace-be/models"
	"marketplace-be/test_utils"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestCreateProduct(t *testing.T) {
	db := test_utils.SetupTestDB(t)

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

	t.Run("Create product successfully", func(t *testing.T) {
		input := models.ProductInput{
			Name:     "Test Product",
			Category: models.Books,
			Price:    10.99,
			Quantity: 5,
			Images: []models.ProductImageInput{
				{MimeType: "image/png", URL: "http://example.com/img1.png", IsMain: true},
				{MimeType: "image/png", URL: "http://example.com/img2.png", IsMain: false},
			},
		}

		body, _ := json.Marshal(input)
		c, w := test_utils.CreateTestContext("POST", "/api/products", body)
		c.Request.Header.Set("Authorization", token)

		// Call the handler
		handlers.CreateProduct(c)

		require.Equal(t, http.StatusCreated, w.Code)

		var created models.Product
		err := json.Unmarshal(w.Body.Bytes(), &created)
		require.NoError(t, err)
		require.Equal(t, "Test Product", created.Name)
		require.Equal(t, models.Books, created.Category)
		require.Len(t, created.Images, 2)
		require.Equal(t, "http://example.com/img1.png", created.Images[0].Url)
	})

	t.Run("Invalid Input Format", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("POST", "/api/products", []byte(`{"invalid":"json"}`))
		c.Request.Header.Set("Authorization", token)

		handlers.CreateProduct(c)
		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "error")
	})

	t.Run("Invalid Category", func(t *testing.T) {
		input := models.ProductInput{
			Name:     "Invalid Cat Product",
			Category: "NonExistentCategory", // Invalid
			Price:    15.0,
		}

		body, _ := json.Marshal(input)
		c, w := test_utils.CreateTestContext("POST", "/api/products", body)
		c.Request.Header.Set("Authorization", token)

		handlers.CreateProduct(c)

		require.Equal(t, http.StatusBadRequest, w.Code)

		var resp map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		require.Contains(t, resp["error"], "invalid category")
	})
}

func TestGetProducts(t *testing.T) {
	db := test_utils.SetupTestDB(t)

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
	db.Create(&models.Product{Pid: "pid-1", Name: "P1", Category: models.Electronics, Price: 100, PopularityScore: 10})
	db.Create(&models.Product{Pid: "pid-2", Name: "P2", Category: models.Books, Price: 50, PopularityScore: 20})
	db.Create(&models.Product{Pid: "pid-3", Name: "Book B", Category: models.Books, Price: 30, PopularityScore: 5})

	t.Run("Default Params", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("GET", "/api/products", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetProducts(c)

		require.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		data := resp["data"].([]interface{})
		require.Len(t, data, 3) // All 3 products
		require.EqualValues(t, 1, resp["page"])
		require.EqualValues(t, 10, resp["pageSize"])
		require.EqualValues(t, 3, resp["totalItems"])
	})

	t.Run("With Pagination", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("GET", "/api/products?page=1&pageSize=2", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetProducts(c)

		require.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		data := resp["data"].([]interface{})
		require.Len(t, data, 2) // Only 2 per page
		require.EqualValues(t, 1, resp["page"])
		require.EqualValues(t, 2, resp["pageSize"])
		require.EqualValues(t, 3, resp["totalItems"])
		require.EqualValues(t, 2, resp["totalPages"]) // 3 items with pageSize=2 = 2 pages
	})

	t.Run("Filter By Category", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("GET", "/api/products?categories=Books", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetProducts(c)

		require.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		data := resp["data"].([]interface{})
		require.Len(t, data, 2) // Only the 2 books
	})

	t.Run("Sort By Price", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("GET", "/api/products?sort=price_desc", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetProducts(c)

		require.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		data := resp["data"].([]interface{})
		first := data[0].(map[string]interface{})
		second := data[1].(map[string]interface{})
		third := data[2].(map[string]interface{})

		// Should be sorted by price descending: P1(100) > P2(50) > Book B(30)
		require.Equal(t, "P1", first["Name"])
		require.Equal(t, "P2", second["Name"])
		require.Equal(t, "Book B", third["Name"])
	})

	t.Run("Filter And Sort Combined", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("GET", "/api/products?categories=Books&sort=price_desc", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetProducts(c)

		require.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		data := resp["data"].([]interface{})
		require.Len(t, data, 2) // Only the 2 books

		first := data[0].(map[string]interface{})
		second := data[1].(map[string]interface{})

		// Books sorted by price: P2(50) > Book B(30)
		require.Equal(t, "P2", first["Name"])
		require.Equal(t, "Book B", second["Name"])
	})
}

func TestGetProductByPID(t *testing.T) {
	db := test_utils.SetupTestDB(t)

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

	t.Run("Success", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("GET", "/api/products/pid-123", nil)
		c.Params = gin.Params{{Key: "pid", Value: "pid-123"}}
		c.Request.Header.Set("Authorization", token)

		handlers.GetProductByPID(c)

		require.Equal(t, http.StatusOK, w.Code)

		var p models.Product
		err := json.Unmarshal(w.Body.Bytes(), &p)
		require.NoError(t, err)
		require.Equal(t, "pid-123", p.Pid)
		require.Len(t, p.Images, 1)
		require.Equal(t, "http://example.com/img.png", p.Images[0].Url)
	})

	t.Run("Product Not Found", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("GET", "/api/products/non-existent", nil)
		c.Params = gin.Params{{Key: "pid", Value: "non-existent"}}
		c.Request.Header.Set("Authorization", token)

		handlers.GetProductByPID(c)

		require.Equal(t, http.StatusNotFound, w.Code)
		require.Contains(t, w.Body.String(), "error")
	})
}

func TestUpdateProduct(t *testing.T) {
	db := test_utils.SetupTestDB(t)

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
		Pid:         "pid-999",
		Name:        "Old Product",
		Category:    models.Books,
		Price:       20,
		Description: "Old desc",
	})
	db.Create(&models.ProductImage{
		Pid: "pid-999", MimeType: "image/png", Url: "http://example.com/old.png", IsMain: true,
	})

	t.Run("Success", func(t *testing.T) {
		updateInput := models.ProductInput{
			Name:     "New Product Name",
			Category: models.Books,
			Price:    30,
			Quantity: 10,
			Images: []models.ProductImageInput{
				{MimeType: "image/jpeg", URL: "http://example.com/new1.jpg", IsMain: true},
				{MimeType: "image/jpeg", URL: "http://example.com/new2.jpg", IsMain: false},
			},
		}

		body, _ := json.Marshal(updateInput)
		c, w := test_utils.CreateTestContext("PUT", "/api/products/pid-999", body)
		c.Request.Header.Set("Authorization", token)
		c.Params = gin.Params{{Key: "pid", Value: "pid-999"}}

		handlers.UpdateProduct(c)

		require.Equal(t, http.StatusOK, w.Code)

		var updated models.Product
		err := json.Unmarshal(w.Body.Bytes(), &updated)
		require.NoError(t, err)
		require.Equal(t, "New Product Name", updated.Name)
		require.EqualValues(t, 30, updated.Price)
		require.Len(t, updated.Images, 2)
		require.Equal(t, "http://example.com/new1.jpg", updated.Images[0].Url)
	})

	t.Run("Product Not Found", func(t *testing.T) {
		updateInput := models.ProductInput{
			Name:     "Updated Name",
			Category: models.Books,
			Price:    25,
		}

		body, _ := json.Marshal(updateInput)
		c, w := test_utils.CreateTestContext("PUT", "/api/products/non-existent", body)
		c.Request.Header.Set("Authorization", token)
		c.Params = gin.Params{{Key: "pid", Value: "non-existent"}}

		handlers.UpdateProduct(c)

		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "error")
	})

	t.Run("Invalid Input", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("PUT", "/api/products/pid-999", []byte(`{"invalid":"json"}`))
		c.Request.Header.Set("Authorization", token)
		c.Params = gin.Params{{Key: "pid", Value: "pid-999"}}

		handlers.UpdateProduct(c)

		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "error")
	})
}

func TestDeleteProduct(t *testing.T) {
	db := test_utils.SetupTestDB(t)

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

	t.Run("Success", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("DELETE", "/api/products/pid-del", nil)
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
		c, w := test_utils.CreateTestContext("DELETE", "/api/products/non-existent", nil)
		c.Request.Header.Set("Authorization", token)
		c.Params = gin.Params{{Key: "pid", Value: "non-existent"}}

		handlers.DeleteProduct(c)
		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "error")
	})
}
