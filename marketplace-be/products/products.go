package products

import (
	"fmt"
	"marketplace-be/database"
	"marketplace-be/models"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ===============================
//        HELPER FUNCTIONS
// ===============================

// validCategory checks if a category is valid according to the ones defined in your models.
func validCategory(cat models.Category) bool {
	switch cat {
	case models.Electronics,
		models.Books,
		models.Clothing,
		models.Furniture,
		models.Tickets,
		models.Sports,
		models.Appliances,
		models.Miscellaneous:
		return true
	}
	return false
}

// parseCategories parses a comma-separated list of category strings into a slice of valid categories.
// Invalid categories are collected in `invalidCats`.
func parseCategories(catString string) (validCats []models.Category, invalidCats []string) {
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

// ===============================
//       HANDLER FUNCTIONS
// ===============================

// CreateProduct - create a Product with optional ProductImages
func CreateProduct(c *gin.Context) {
	var input models.ProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate category
	if !validCategory(input.Category) {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid category: %s", input.Category)})
		return
	}

	newPID := uuid.NewString()
	product := models.Product{
		Pid:         newPID,
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		Category:    input.Category,
		Quantity:    input.Quantity,
		// For new product, popularityScore = 0 by default (in your model) or set it as needed
	}

	// Create the product in DB
	if err := database.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create product"})
		return
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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create product images"})
			return
		}
	}

	// Optionally fetch the newly created product with images to return the full data
	var createdProduct models.Product
	database.DB.Where("pid = ?", newPID).Preload("Images").First(&createdProduct)
	c.JSON(http.StatusCreated, createdProduct)
}

// GetProducts - fetch products with filtering, sorting, and pagination
func GetProducts(c *gin.Context) {
	query := database.DB.Model(&models.Product{}).Preload("Images")

	// =========== Filtering ===========

	// Categories (e.g. /products?categories=Electronics,Books)
	categoriesParam := c.Query("categories")
	if categoriesParam != "" {
		validCats, invalidCats := parseCategories(categoriesParam)
		if len(invalidCats) > 0 {
			// If we want to fail on invalid categories, do so:
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Invalid category(ies): %v", invalidCats),
			})
			return
		}
		if len(validCats) > 0 {
			query = query.Where("category IN ?", validCats)
		}
	}

	// =========== Sorting ===========

	// default sort = relevance => popularity_score DESC
	sortParam := c.Query("sort")
	switch sortParam {
	case "price_asc":
		query = query.Order("price ASC")
	case "price_desc":
		query = query.Order("price DESC")
	case "category_asc":
		query = query.Order("category ASC")
	case "category_desc":
		query = query.Order("category DESC")
	case "relevance", "": // default
		query = query.Order("popularity_score DESC")
	default:
		// If an unknown sort is provided, ignore or return an error:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid sort parameter"})
		return
	}

	// =========== Pagination ===========
	pageParam := c.Query("page")
	pageSizeParam := c.Query("pageSize")

	page := 1
	pageSize := 10
	var err error

	if pageParam != "" {
		page, err = strconv.Atoi(pageParam)
		if err != nil || page <= 0 {
			page = 1
		}
	}
	if pageSizeParam != "" {
		pageSize, err = strconv.Atoi(pageSizeParam)
		if err != nil || pageSize <= 0 {
			pageSize = 10
		}
	}

	offset := (page - 1) * pageSize

	// Execute the count query first (for total items)
	var totalCount int64
	err = query.Count(&totalCount).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch products count"})
		return
	}

	// Apply limit + offset
	query = query.Limit(pageSize).Offset(offset)

	var products []models.Product
	if err := query.Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch products"})
		return
	}

	// Return products plus some pagination metadata
	c.JSON(http.StatusOK, gin.H{
		"data":       products,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": totalCount,
		"totalPages": (totalCount + int64(pageSize) - 1) / int64(pageSize), // ceiling
	})
}

// GetProductByPID - Retrieves a product by PID
func GetProductByPID(c *gin.Context) {
	productPID := c.Param("pid")

	var product models.Product
	err := database.DB.Preload("Images").Where("pid = ?", productPID).First(&product).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// UpdateProduct - Updates a product and optionally images
func UpdateProduct(c *gin.Context) {
	productPID := c.Param("pid")

	// Fetch existing product
	var existingProduct models.Product
	if err := database.DB.Preload("Images").Where("pid = ?", productPID).First(&existingProduct).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Bind input
	var input models.ProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !validCategory(input.Category) {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid category: %s", input.Category)})
		return
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update product"})
		return
	}

	// If images are provided, let's handle them:
	// Strategy: delete existing images & recreate them, or update them in place.
	// For simplicity, let's remove existing images and re-create new ones
	if len(input.Images) > 0 {
		// Delete existing images
		if err := database.DB.Where("pid = ?", productPID).Delete(&models.ProductImage{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update product images"})
			return
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
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create updated product images"})
				return
			}
		}
	}

	// Reload product with images
	if err := database.DB.Preload("Images").Where("pid = ?", productPID).First(&existingProduct).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reloading product"})
		return
	}

	c.JSON(http.StatusOK, existingProduct)
}

// DeleteProduct - Deletes a product by PID
func DeleteProduct(c *gin.Context) {
	productPID := c.Param("pid")

	// First, try to delete product images (cascade or manual)
	if err := database.DB.Where("pid = ?", productPID).Delete(&models.ProductImage{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete product images"})
		return
	}

	if err := database.DB.Where("pid = ?", productPID).Delete(&models.Product{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}
