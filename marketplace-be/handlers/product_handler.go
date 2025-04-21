package handlers

import (
	"fmt"
	"marketplace-be/auth"
	"marketplace-be/dtos"
	"marketplace-be/models"
	"marketplace-be/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetProducts handles fetching products with optional filtering, sorting, and pagination.
func GetProducts(c *gin.Context) {
	categoriesParam := c.Query("categories")
	sortParam := c.Query("sort")

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

	getProductsResponse, err := services.GetProductsService(categoriesParam, sortParam, page, pageSize)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, getProductsResponse)
}

// GetProductByPID handles retrieving a single product by PID.
func GetProductByPID(c *gin.Context) {
	pid := c.Param("pid")

	product, err := services.GetProductByPIDService(pid)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, product)
}

// CreateProduct handles the HTTP request to create a product.
func CreateProduct(c *gin.Context) {
	if err := c.Request.ParseMultipartForm(100 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse multipart form"})
		return
	}

	categoryStr := c.PostForm("category")
	category := models.Category(categoryStr)

	// Validate category
	if !services.ValidCategory(category) {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid category: %s", categoryStr)})
		return
	}

	input := dtos.ProductInput{
		Name:        c.PostForm("name"),
		Description: c.PostForm("description"),
		Category:    category,
	}

	// Parse numeric values
	price, err := strconv.ParseFloat(c.PostForm("price"), 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid price format"})
		return
	}
	input.Price = price

	quantity, err := strconv.Atoi(c.PostForm("quantity"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid quantity format"})
		return
	}
	input.Quantity = quantity

	// Get uploaded files
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	files := form.File["files"]
	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	err = services.CreateProductService(input, files, userUid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Product created successfully"})
}

// UpdateProduct handles updating an existing product (and its images).
func UpdateProduct(c *gin.Context) {
	pid := c.Param("pid")

	var input dtos.ProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedProduct, err := services.UpdateProductService(pid, input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedProduct)
}

// DeleteProduct handles deleting a product by PID.
func DeleteProduct(c *gin.Context) {
	pid := c.Param("pid")

	if err := services.DeleteProductService(pid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}
