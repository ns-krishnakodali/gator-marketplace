package services

import (
	"fmt"
	"marketplace-be/database"
	"marketplace-be/models"
	"strings"
	"time"

	"github.com/google/uuid"
)

// validCategory checks if a category is valid according to the ones defined in your models.
func validCategory(category models.Category) bool {
	switch category {
	case models.Appliances,
		models.Books,
		models.Clothing,
		models.Electronics,
		models.Entertainment,
		models.Furniture,
		models.Miscellaneous,
		models.Sports,
		models.Tickets:
		return true
	}
	return false
}

// ParseCategories parses a comma-separated list of category strings into a slice of valid categories.
// Invalid categories are collected in `invalidCats`.
func ParseCategories(catString string) (validCats []models.Category, invalidCats []string) {
	cats := strings.Split(catString, ",")
	for _, c := range cats {
		c = strings.TrimSpace(c)
		category := models.Category(c)
		if validCategory(category) {
			validCats = append(validCats, category)
		} else {
			invalidCats = append(invalidCats, c)
		}
	}
	return validCats, invalidCats
}

// CreateProduct creates a product (and optional images) in the database.
func CreateProduct(input models.ProductInput) (models.Product, error) {
	// Validate category
	if !validCategory(input.Category) {
		return models.Product{}, fmt.Errorf("invalid category: %s", input.Category)
	}

	newPID := uuid.NewString()
	product := models.Product{
		Pid:         newPID,
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		Category:    input.Category,
		Quantity:    input.Quantity,
		// popularity_score will default to 0 (if that's in your model)
	}

	// Create the product
	if err := database.DB.Create(&product).Error; err != nil {
		return models.Product{}, fmt.Errorf("could not create product: %v", err)
	}

	// Create images if provided
	for _, img := range input.Images {
		imageModel := models.ProductImage{
			Pid:      newPID,
			MimeType: img.MimeType,
			Url:      img.URL,
			IsMain:   img.IsMain,
		}
		if err := database.DB.Create(&imageModel).Error; err != nil {
			return models.Product{}, fmt.Errorf("could not create product images: %v", err)
		}
	}

	// Fetch the newly created product with images
	var createdProduct models.Product
	if err := database.DB.Where("pid = ?", newPID).Preload("Images").First(&createdProduct).Error; err != nil {
		return models.Product{}, fmt.Errorf("could not fetch created product")
	}

	return createdProduct, nil
}

// GetProductsService fetches products with filtering, sorting, and pagination.
func GetProductsService(categoriesParam, sortParam string, page, pageSize int) ([]models.Product, int64, error) {
	query := database.DB.Model(&models.Product{}).Preload("Images")

	// =========== Filtering ===========

	if categoriesParam != "" {
		validCategories, invalidCategories := ParseCategories(categoriesParam)
		if len(invalidCategories) > 0 {
			return nil, 0, fmt.Errorf("invalid categories: %v", invalidCategories)
		}
		if len(validCategories) > 0 {
			query = query.Where("category IN ?", validCategories)
		}
	}

	// =========== Sorting ===========
	switch sortParam {
	case "price_asc":
		query = query.Order("price ASC")
	case "price_desc":
		query = query.Order("price DESC")
	case "name_asc":
		query = query.Order("name ASC")
	case "name_desc":
		query = query.Order("name DESC")
	case "newest":
		query = query.Order("created_at DESC")
	case "most_popular", "":
		query = query.Order("popularity_score DESC")
	default:
		return nil, 0, fmt.Errorf("invalid sort parameter")
	}

	// Execute the count query first (for total items)
	var totalCount int64
	if err := query.Count(&totalCount).Error; err != nil {
		return nil, 0, fmt.Errorf("could not fetch products count")
	}

	// =========== Pagination ===========
	offset := (page - 1) * pageSize
	query = query.Limit(pageSize).Offset(offset)

	var products []models.Product
	if err := query.Omit("id").Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("could not fetch products")
	}

	return products, totalCount, nil
}

// GetProductByPIDService retrieves a product by PID.
func GetProductByPIDService(productPID string) (models.Product, error) {
	var product models.Product
	err := database.DB.Preload("Images").Where("pid = ?", productPID).First(&product).Error
	if err != nil {
		return product, fmt.Errorf("product not found")
	}
	return product, nil
}

// UpdateProductService updates a product (and optionally images) in the DB.
func UpdateProductService(productPID string, input models.ProductInput) (models.Product, error) {
	// Fetch existing product
	var existingProduct models.Product
	if err := database.DB.Preload("Images").Where("pid = ?", productPID).First(&existingProduct).Error; err != nil {
		return existingProduct, fmt.Errorf("product not found")
	}

	// Validate category
	if !validCategory(input.Category) {
		return existingProduct, fmt.Errorf("invalid category: %s", input.Category)
	}

	// Update fields
	existingProduct.Name = input.Name
	existingProduct.Description = input.Description
	existingProduct.Price = input.Price
	existingProduct.Category = input.Category
	existingProduct.Quantity = input.Quantity
	existingProduct.UpdatedAt = time.Now()

	// Save product
	if err := database.DB.Save(&existingProduct).Error; err != nil {
		return existingProduct, fmt.Errorf("could not update product")
	}

	// If images are provided, handle them:
	if len(input.Images) > 0 {
		// Delete existing images
		if err := database.DB.Where("pid = ?", productPID).Delete(&models.ProductImage{}).Error; err != nil {
			return existingProduct, fmt.Errorf("could not update product images")
		}
		// Create new images
		for _, img := range input.Images {
			newImg := models.ProductImage{
				Pid:      productPID,
				MimeType: img.MimeType,
				Url:      img.URL,
				IsMain:   img.IsMain,
			}
			if err := database.DB.Create(&newImg).Error; err != nil {
				return existingProduct, fmt.Errorf("could not create updated product images")
			}
		}
	}

	// Reload product with images
	if err := database.DB.Preload("Images").Where("pid = ?", productPID).First(&existingProduct).Error; err != nil {
		return existingProduct, fmt.Errorf("error reloading product")
	}

	return existingProduct, nil
}

// DeleteProductService deletes a product by PID (and its related images).
func DeleteProductService(productPID string) error {
	// First, delete product images (if not using Cascade)
	if err := database.DB.Where("pid = ?", productPID).Delete(&models.ProductImage{}).Error; err != nil {
		return fmt.Errorf("could not delete product images")
	}

	if err := database.DB.Where("pid = ?", productPID).Delete(&models.Product{}).Error; err != nil {
		return fmt.Errorf("could not delete product")
	}

	return nil
}
