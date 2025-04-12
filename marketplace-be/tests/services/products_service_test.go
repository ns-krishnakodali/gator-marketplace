package services_test

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/require"

	"marketplace-be/dtos"
	"marketplace-be/models"
	"marketplace-be/services"
	"marketplace-be/test_utils"
)

func TestCreateProductService(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	user := &models.User{
		Uid:             "user-pid",
		Email:           "product-test@ufl.edu",
		Name:            "Test Product User",
		DisplayName:     "TestProductUser123",
		Mobile:          "123-456-7890",
		DisplayImageUrl: "https://example.com/image.jpg",
	}
	db.Create(user)

	t.Run("Created product Success", func(t *testing.T) {
		input := dtos.ProductInput{
			Name:     "Service Product",
			Category: models.Books,
			Price:    12.34,
			Quantity: 2,
			Images: []dtos.ProductImageInput{
				{MimeType: "image/png", URL: "http://example.com/book.png", IsMain: true},
			},
		}

		err := services.CreateProduct(input, user.Uid)
		require.NoError(t, err)
	})

	t.Run("Invalid Category", func(t *testing.T) {
		input := dtos.ProductInput{
			Name:     "Invalid Category",
			Category: "NoSuchCategory",
			Price:    10.0,
		}

		err := services.CreateProduct(input, user.Uid)
		require.Error(t, err)
		require.Contains(t, err.Error(), "invalid category")
	})
}

func TestGetProductsService(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	t.Run("Get products Success", func(t *testing.T) {
		db.Create(&models.Product{Pid: "p1", Name: "P1", Category: models.Electronics, Price: 100, PopularityScore: 10})
		db.Create(&models.Product{Pid: "p2", Name: "P2", Category: models.Books, Price: 50, PopularityScore: 20})

		products, err := services.GetProductsService("", "", 1, 10)
		require.NoError(t, err)
		require.EqualValues(t, 2, products.TotalItems)
		require.Len(t, products.Products, 2)

		// Optionally check JSON fields
		raw, _ := json.Marshal(products)
		require.Contains(t, string(raw), "P1")
		require.Contains(t, string(raw), "P2")
	})

	t.Run("Filter And Sort", func(t *testing.T) {
		// Clear existing products
		db.Exec("DELETE FROM products")

		db.Create(&models.Product{Pid: "p5", Name: "Laptop", Category: models.Electronics, Price: 500, PopularityScore: 30})
		db.Create(&models.Product{Pid: "p6", Name: "Book A", Category: models.Books, Price: 20, PopularityScore: 40})
		db.Create(&models.Product{Pid: "p7", Name: "Book B", Category: models.Books, Price: 10, PopularityScore: 50})
		db.Create(&models.Product{Pid: "p8", Name: "Socks", Category: models.Clothing, Price: 5, PopularityScore: 5})

		// Filter=Books, sort=price_desc
		products, err := services.GetProductsService("Books", "price_desc", 1, 10)
		require.NoError(t, err)
		require.Len(t, products.Products, 2)
		require.EqualValues(t, 2, products.TotalItems)

		// Should be [Book A(20), Book B(10)]
		require.Equal(t, "Book A", products.Products[0].Name)
		require.EqualValues(t, 20, products.Products[0].Price)
		require.Equal(t, "Book B", products.Products[1].Name)
		require.EqualValues(t, 10, products.Products[1].Price)
	})

	t.Run("Pagination", func(t *testing.T) {
		// Clear existing products
		db.Exec("DELETE FROM products")

		// Create 5 products
		db.Create(&models.Product{Pid: "p10", Name: "Product 1", Category: models.Electronics, Price: 100})
		db.Create(&models.Product{Pid: "p11", Name: "Product 2", Category: models.Electronics, Price: 200})
		db.Create(&models.Product{Pid: "p12", Name: "Product 3", Category: models.Electronics, Price: 300})
		db.Create(&models.Product{Pid: "p13", Name: "Product 4", Category: models.Electronics, Price: 400})
		db.Create(&models.Product{Pid: "p14", Name: "Product 5", Category: models.Electronics, Price: 500})

		// Test page 1 with page size 2
		page1, err := services.GetProductsService("", "price_asc", 1, 2)
		require.NoError(t, err)
		require.Len(t, page1.Products, 2)
		require.EqualValues(t, 5, page1.TotalItems)
		require.EqualValues(t, 3, page1.TotalPages)
		require.EqualValues(t, 1, page1.Page)
		require.EqualValues(t, 2, page1.PageSize)

		// Verify correct items on page 1 (sorted by price ascending)
		require.Equal(t, "Product 1", page1.Products[0].Name)
		require.Equal(t, "Product 2", page1.Products[1].Name)

		// Test page 2 with page size 2
		page2, err := services.GetProductsService("", "price_asc", 2, 2)
		require.NoError(t, err)
		require.Len(t, page2.Products, 2)
		require.EqualValues(t, 2, page2.Page)

		// Verify correct items on page 2
		require.Equal(t, "Product 3", page2.Products[0].Name)
		require.Equal(t, "Product 4", page2.Products[1].Name)
	})

	t.Run("Multiple Categories Filter", func(t *testing.T) {
		// Clear existing products
		db.Exec("DELETE FROM products")

		// Create products across different categories
		db.Create(&models.Product{Pid: "p20", Name: "TV", Category: models.Electronics, Price: 500})
		db.Create(&models.Product{Pid: "p21", Name: "Novel", Category: models.Books, Price: 20})
		db.Create(&models.Product{Pid: "p22", Name: "T-Shirt", Category: models.Clothing, Price: 30})
		db.Create(&models.Product{Pid: "p23", Name: "Headphones", Category: models.Electronics, Price: 100})
		db.Create(&models.Product{Pid: "p24", Name: "Textbook", Category: models.Books, Price: 50})

		// Filter by multiple categories (Electronics,Books)
		products, err := services.GetProductsService("Electronics,Books", "price_desc", 1, 10)
		require.NoError(t, err)
		require.Len(t, products.Products, 4)
		require.EqualValues(t, 4, products.TotalItems)

		// Should NOT contain Clothing items
		for _, p := range products.Products {
			require.NotEqual(t, "T-Shirt", p.Name)
		}

		// First item should be TV (highest price in Electronics)
		require.Equal(t, "TV", products.Products[0].Name)
	})

	t.Run("Invalid Category Filter", func(t *testing.T) {
		// Test with an invalid category
		_, err := services.GetProductsService("InvalidCategory", "", 1, 10)
		require.Error(t, err)
		require.Contains(t, err.Error(), "invalid categories")
	})
}

func TestGetProductByPIDService(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	t.Run("Get product by pid Success", func(t *testing.T) {
		db.Create(&models.Product{Pid: "pid-xyz", Name: "XYZ Product", Category: models.Clothing, Price: 19.99})
		db.Create(&models.ProductImage{Pid: "pid-xyz", Url: "http://example.com/xyz.png", IsMain: true})

		product, err := services.GetProductByPIDService("pid-xyz")
		require.NoError(t, err)
		require.Equal(t, "pid-xyz", product.Pid)
		require.Len(t, product.Images, 1)
	})

	t.Run("Product not found returns error", func(t *testing.T) {
		_, err := services.GetProductByPIDService("non-existent-pid")
		require.Error(t, err)
		require.Equal(t, "product not found", err.Error())
	})

	t.Run("Get product with multiple images", func(t *testing.T) {
		// Create test product with multiple images
		db.Create(&models.Product{
			Pid:         "pid-multi-img",
			Name:        "Multi Image Product",
			Category:    models.Electronics,
			Price:       299.99,
			Description: "Product with multiple images",
		})

		// Create multiple images for the product
		db.Create(&models.ProductImage{Pid: "pid-multi-img", Url: "http://example.com/main.jpg", IsMain: true, MimeType: "image/jpeg"})
		db.Create(&models.ProductImage{Pid: "pid-multi-img", Url: "http://example.com/side.jpg", IsMain: false, MimeType: "image/jpeg"})
		db.Create(&models.ProductImage{Pid: "pid-multi-img", Url: "http://example.com/back.jpg", IsMain: false, MimeType: "image/jpeg"})

		product, err := services.GetProductByPIDService("pid-multi-img")
		require.NoError(t, err)
		require.Equal(t, "pid-multi-img", product.Pid)
		require.Equal(t, "Multi Image Product", product.Name)
		require.Equal(t, models.Electronics, product.Category)
		require.Equal(t, 299.99, product.Price)
		require.Len(t, product.Images, 3)

		// Verify one image is marked as main
		mainImageCount := 0
		for _, img := range product.Images {
			if img.IsMain {
				mainImageCount++
				require.Equal(t, "image/jpeg", img.MimeType)
			}
		}
		require.Equal(t, 1, mainImageCount)
	})

	t.Run("Get product with user details", func(t *testing.T) {
		// Create a user first
		user := models.User{
			Uid:         "user-123",
			DisplayName: "Test User",
			Email:       "test@example.com",
		}
		db.Create(&user)

		// Create a product with the user reference
		product := models.Product{
			Pid:         "pid-with-user",
			Name:        "User Product",
			Category:    models.Books,
			Price:       49.99,
			Description: "Product with user details",
			UserUID:     "user-123",
		}
		db.Create(&product)
		db.Create(&models.ProductImage{Pid: "pid-with-user", Url: "http://example.com/product.png", IsMain: true})

		// Get the product
		result, err := services.GetProductByPIDService("pid-with-user")
		require.NoError(t, err)
		require.Equal(t, "pid-with-user", result.Pid)
		require.Equal(t, "user-123", result.UserUID)
		require.Equal(t, "Test User", result.PostedBy)
	})
}

func TestUpdateProductService(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	t.Run("Update Product details Success", func(t *testing.T) {
		db.Create(&models.Product{
			Pid:         "pid-upd",
			Name:        "Old Name",
			Description: "Old Description",
			Category:    models.Books,
			Price:       10.0,
		})
		db.Create(&models.ProductImage{
			Pid: "pid-upd", MimeType: "image/png", Url: "http://example.com/old.png", IsMain: true,
		})

		input := dtos.ProductInput{
			Name:        "New Name",
			Description: "New Desc",
			Category:    models.Books,
			Price:       20.0,
			Quantity:    5,
			Images: []dtos.ProductImageInput{
				{MimeType: "image/jpeg", URL: "http://example.com/new1.jpg", IsMain: true},
				{MimeType: "image/jpeg", URL: "http://example.com/new2.jpg", IsMain: false},
			},
		}

		updated, err := services.UpdateProductService("pid-upd", input)
		require.NoError(t, err)
		require.Equal(t, "pid-upd", updated.Pid)
		require.Equal(t, "New Name", updated.Name)
		require.EqualValues(t, 20.0, updated.Price)
		require.Len(t, updated.Images, 2)
		require.Equal(t, "http://example.com/new1.jpg", updated.Images[0].Url)
	})
}

func TestDeleteProductService(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	t.Run("Delete Product details Success", func(t *testing.T) {
		db.Create(&models.Product{Pid: "pid-del-svc", Name: "Service Delete"})
		db.Create(&models.ProductImage{Pid: "pid-del-svc", Url: "http://example.com/img.png"})

		err := services.DeleteProductService("pid-del-svc")
		require.NoError(t, err)

		// Confirm it's deleted
		var p models.Product
		findErr := db.Where("pid = ?", "pid-del-svc").First(&p).Error
		require.Error(t, findErr) // should be not found
	})
}
