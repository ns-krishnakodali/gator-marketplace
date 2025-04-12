package handlers

import (
	"marketplace-be/auth"
	"marketplace-be/dtos"
	"marketplace-be/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CreateProduct handles the HTTP request to create a product.
func CreateProduct(c *gin.Context) {
	var input dtos.ProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userUid, _ := auth.ExtractUserID(c.GetHeader("Authorization"))

	createdProduct, err := services.CreateProduct(input, userUid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdProduct)
}

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

	products, totalCount, err := services.GetProductsService(categoriesParam, sortParam, page, pageSize)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       products,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": totalCount,
		"totalPages": (totalCount + int64(pageSize) - 1) / int64(pageSize), // ceiling
	})
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
