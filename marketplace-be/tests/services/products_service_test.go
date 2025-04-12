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

		created, err := services.CreateProduct(input, user.Uid)
		require.NoError(t, err)
		require.NotEmpty(t, created.Pid)
		require.Equal(t, "Service Product", created.Name)
		require.Equal(t, models.Books, created.Category)
		require.Len(t, created.Images, 1)
		require.Equal(t, "http://example.com/book.png", created.Images[0].Url)
	})

	t.Run("Invalid Category", func(t *testing.T) {
		input := dtos.ProductInput{
			Name:     "Invalid Category",
			Category: "NoSuchCategory",
			Price:    10.0,
		}

		_, err := services.CreateProduct(input, user.Uid)
		require.Error(t, err)
		require.Contains(t, err.Error(), "invalid category")
	})
}

func TestGetProductsService(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	t.Run("Get products Success", func(t *testing.T) {
		db.Create(&models.Product{Pid: "p1", Name: "P1", Category: models.Electronics, Price: 100, PopularityScore: 10})
		db.Create(&models.Product{Pid: "p2", Name: "P2", Category: models.Books, Price: 50, PopularityScore: 20})

		products, totalCount, err := services.GetProductsService("", "", 1, 10)
		require.NoError(t, err)
		require.EqualValues(t, 2, totalCount)
		require.Len(t, products, 2)

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
		products, totalCount, err := services.GetProductsService("Books", "price_desc", 1, 10)
		require.NoError(t, err)
		require.Len(t, products, 2)
		require.EqualValues(t, 2, totalCount)

		// Should be [Book A(20), Book B(10)]
		require.Equal(t, "Book A", products[0].Name)
		require.EqualValues(t, 20, products[0].Price)
		require.Equal(t, "Book B", products[1].Name)
		require.EqualValues(t, 10, products[1].Price)
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
