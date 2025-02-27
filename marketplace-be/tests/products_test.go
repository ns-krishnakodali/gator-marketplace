package handlers_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"

	"marketplace-be/models"
	"marketplace-be/products"
	"marketplace-be/test_utils"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestCreateProduct_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)
	_ = db

	// Input with valid category
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

	products.CreateProduct(c)

	require.Equal(t, http.StatusCreated, w.Code)

	var created models.Product
	err := json.Unmarshal(w.Body.Bytes(), &created)
	require.NoError(t, err)
	require.Equal(t, "Test Product", created.Name)
	require.Equal(t, models.Books, created.Category)
	require.Len(t, created.Images, 2)
	require.Equal(t, "http://example.com/img1.png", created.Images[0].Url)
}

func TestCreateProduct_InvalidCategory(t *testing.T) {
	db := test_utils.SetupTestDB(t)
	_ = db

	input := models.ProductInput{
		Name:     "Invalid Cat Product",
		Category: "NonExistentCategory", // Invalid
		Price:    15.0,
	}

	body, _ := json.Marshal(input)
	c, w := test_utils.CreateTestContext("POST", "/api/products", body)
	products.CreateProduct(c)

	require.Equal(t, http.StatusBadRequest, w.Code)

	var resp map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	require.Contains(t, resp["error"], "Invalid category")
}

func TestGetProducts_Simple(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	// Insert some products manually
	db.Create(&models.Product{Pid: "pid-1", Name: "P1", Category: models.Electronics, Price: 100, PopularityScore: 10})
	db.Create(&models.Product{Pid: "pid-2", Name: "P2", Category: models.Books, Price: 50, PopularityScore: 20})

	c, w := test_utils.CreateTestContext("GET", "/api/products", nil)
	// No query params => default sort by relevance
	products.GetProducts(c)

	require.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)

	require.NotNil(t, resp["data"])
	data := resp["data"].([]interface{})
	require.Len(t, data, 2) // We created 2 above

	// Check pagination fields
	require.EqualValues(t, 1, resp["page"])
	require.EqualValues(t, 10, resp["pageSize"])
	require.EqualValues(t, 2, resp["totalItems"])
}

func TestGetProducts_FilterAndSort(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	// Insert multiple products
	db.Create(&models.Product{Pid: "p1", Name: "Laptop", Category: models.Electronics, Price: 500, PopularityScore: 30})
	db.Create(&models.Product{Pid: "p2", Name: "Book A", Category: models.Books, Price: 20, PopularityScore: 40})
	db.Create(&models.Product{Pid: "p3", Name: "Book B", Category: models.Books, Price: 10, PopularityScore: 50})
	db.Create(&models.Product{Pid: "p4", Name: "Socks", Category: models.Clothing, Price: 5, PopularityScore: 5})

	// e.g. we want to filter for Books, sorted by price_desc
	c, w := test_utils.CreateTestContext("GET", "/api/products?categories=Books&sort=price_desc", nil)
	products.GetProducts(c)

	require.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)

	data, ok := resp["data"].([]interface{})
	require.True(t, ok)
	require.Len(t, data, 2) // Only the 2 books

	// Check they are sorted by price desc => [Book A(20), Book B(10)]
	first := data[0].(map[string]interface{})
	second := data[1].(map[string]interface{})

	require.Equal(t, "Book A", first["Name"])
	require.EqualValues(t, 20, first["Price"])
	require.Equal(t, "Book B", second["Name"])
	require.EqualValues(t, 10, second["Price"])
}

func TestGetProductByPID_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)

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

	c, w := test_utils.CreateTestContext("GET", "/api/products/pid-123", nil)
	c.Params = gin.Params{{Key: "pid", Value: "pid-123"}}

	products.GetProductByPID(c)

	require.Equal(t, http.StatusOK, w.Code)

	var p models.Product
	err := json.Unmarshal(w.Body.Bytes(), &p)
	require.NoError(t, err)
	require.Equal(t, "pid-123", p.Pid)
	require.Len(t, p.Images, 1)
	require.Equal(t, "http://example.com/img.png", p.Images[0].Url)
}

func TestUpdateProduct_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)

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

	// Attempt an update
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
	c.Params = gin.Params{{Key: "pid", Value: "pid-999"}}

	products.UpdateProduct(c)

	require.Equal(t, http.StatusOK, w.Code)

	var updated models.Product
	err := json.Unmarshal(w.Body.Bytes(), &updated)
	require.NoError(t, err)
	require.Equal(t, "New Product Name", updated.Name)
	require.EqualValues(t, 30, updated.Price)
	require.Len(t, updated.Images, 2)
	require.Equal(t, "http://example.com/new1.jpg", updated.Images[0].Url)
}

func TestDeleteProduct_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	db.Create(&models.Product{Pid: "pid-del", Name: "ToDelete"})
	db.Create(&models.ProductImage{Pid: "pid-del", Url: "http://example.com/img.png"})

	c, w := test_utils.CreateTestContext("DELETE", "/api/products/pid-del", nil)
	c.Params = gin.Params{{Key: "pid", Value: "pid-del"}}

	products.DeleteProduct(c)
	require.Equal(t, http.StatusOK, w.Code)

	var resp map[string]string
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	require.Equal(t, "Product deleted successfully", resp["message"])

	// Confirm it's deleted
	var p models.Product
	err := db.Where("pid = ?", "pid-del").First(&p).Error
	require.Error(t, err) // should be not found
}
