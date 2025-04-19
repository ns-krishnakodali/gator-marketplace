package services

import (
	"fmt"
	"marketplace-be/aws"
	"marketplace-be/database"
	"marketplace-be/dtos"
	"marketplace-be/models"
	"math"
	"mime/multipart"
	"strings"

	"github.com/google/uuid"
)

// GetProductsService fetches products with filtering, sorting, and pagination.
func GetProductsService(categoriesParam, sortParam string, page, pageSize int) (dtos.GetProductsResponse, error) {
	query := database.DB.Model(&models.Product{}).Preload("PostedBy").Preload("Images", "is_main = true")

	if categoriesParam != "" {
		validCategories, invalidCategories := parseCategories(categoriesParam)
		if len(invalidCategories) > 0 {
			return dtos.GetProductsResponse{}, fmt.Errorf("invalid categories: %v", invalidCategories)
		}
		if len(validCategories) > 0 {
			query = query.Where("category IN ?", validCategories)
		}
	}

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
		return dtos.GetProductsResponse{}, fmt.Errorf("invalid sort parameter")
	}

	var totalCount int64
	if err := query.Count(&totalCount).Error; err != nil {
		return dtos.GetProductsResponse{}, fmt.Errorf("could not fetch products count")
	}

	// =========== Pagination ===========
	offset := (page - 1) * pageSize
	query = query.Limit(pageSize).Offset(offset)

	var products []models.Product
	if err := query.Find(&products).Error; err != nil {
		return dtos.GetProductsResponse{}, fmt.Errorf("could not fetch products")
	}

	// Convert products to DTOs
	productDTOs := make([]dtos.ProductDetails, len(products))
	for i, product := range products {
		var imageDTO dtos.ProductImageDTO
		if len(product.Images) > 0 {
			imageDTO = dtos.ProductImageDTO{
				IsMain:   true,
				Url:      product.Images[0].Url,
				MimeType: product.Images[0].MimeType,
			}
		}

		productDTOs[i] = dtos.ProductDetails{
			Pid:      product.Pid,
			UserUID:  product.UserUID,
			Name:     product.Name,
			Price:    product.Price,
			PostedAt: product.CreatedAt,
			Image:    imageDTO,
		}
	}

	// Calculate total pages
	totalPages := int32(0)
	if pageSize > 0 {
		totalPages = int32(math.Ceil(float64(totalCount) / float64(pageSize)))
	}

	// Create the response
	response := dtos.GetProductsResponse{
		Products:   productDTOs,
		Page:       int32(page),
		PageSize:   int32(pageSize),
		TotalItems: int32(totalCount),
		TotalPages: totalPages,
	}

	return response, nil
}

// GetProductByPIDService retrieves a product by PID.
func GetProductByPIDService(productPID string) (dtos.ProductResponse, error) {
	var product models.Product
	err := database.DB.Preload("PostedBy").Preload("Images").Omit("id").Where("pid = ?", productPID).First(&product).Error
	if err != nil {
		return dtos.ProductResponse{}, ErrProductNotFound
	}

	imageDTOs := make([]dtos.ProductImageDTO, len(product.Images))
	for iIndex, image := range product.Images {
		imageDTOs[iIndex] = dtos.ProductImageDTO{
			Url:      image.Url,
			MimeType: image.MimeType,
			IsMain:   image.IsMain,
		}
	}

	return dtos.ProductResponse{
		Pid:             productPID,
		UserUID:         product.UserUID,
		Name:            product.Name,
		Price:           product.Price,
		Description:     product.Description,
		Category:        product.Category,
		Quantity:        product.Quantity,
		PopularityScore: product.PopularityScore,
		PostedAt:        product.CreatedAt,
		PostedBy:        product.PostedBy.DisplayName,
		Images:          imageDTOs,
	}, nil
}

// CreateProduct creates a product (and optional images) in the database.
func CreateProduct(input dtos.ProductInput, files []*multipart.FileHeader, userUid string) error {
	newPID := uuid.NewString()
	product := models.Product{
		Pid:             newPID,
		UserUID:         userUid,
		Name:            input.Name,
		Description:     input.Description,
		Price:           input.Price,
		Category:        input.Category,
		Quantity:        input.Quantity,
		PopularityScore: 0,
	}

	if err := database.DB.Create(&product).Error; err != nil {
		return fmt.Errorf("could not create product: %v", err)
	}

	imageURLs, errs := aws.UploadImages(aws.S3Client, files, "products", newPID)
	if errs != nil {
		fmt.Printf("Image uploading failed to S3: %s\n", errs[0])
		return ErrImageUploadFailed
	}

	for idx, url := range imageURLs {
		imageModel := models.ProductImage{
			Pid:      newPID,
			MimeType: files[idx].Header.Get("Content-Type"),
			Url:      url,
			IsMain:   idx == 0,
		}

		if err := database.DB.Create(&imageModel).Error; err != nil {
			return fmt.Errorf("could not save image record: %v", err)
		}
	}

	return nil
}

// UpdateProductService updates a product (and optionally images) in the DB.
func UpdateProductService(productPID string, input dtos.ProductInput) (models.Product, error) {
	// var existingProduct models.Product
	// if err := database.DB.Preload("Images").Where("pid = ?", productPID).First(&existingProduct).Error; err != nil {
	// 	return existingProduct, fmt.Errorf("product not found")
	// }

	// if !validCategory(input.Category) {
	// 	return existingProduct, fmt.Errorf("invalid category: %s", input.Category)
	// }

	// existingProduct.Name = input.Name
	// existingProduct.Description = input.Description
	// existingProduct.Price = input.Price
	// existingProduct.Category = input.Category
	// existingProduct.Quantity = input.Quantity
	// existingProduct.UpdatedAt = time.Now()

	// if err := database.DB.Save(&existingProduct).Error; err != nil {
	// 	return existingProduct, fmt.Errorf("could not update product")
	// }

	// if len(input.Images) > 0 {
	// 	// Delete existing images
	// 	if err := database.DB.Where("pid = ?", productPID).Delete(&models.ProductImage{}).Error; err != nil {
	// 		return existingProduct, fmt.Errorf("could not update product images")
	// 	}
	// 	// Create new images
	// 	for _, img := range input.Images {
	// 		newImg := models.ProductImage{
	// 			Pid:      productPID,
	// 			MimeType: img.MimeType,
	// 			Url:      img.URL,
	// 			IsMain:   img.IsMain,
	// 		}
	// 		if err := database.DB.Create(&newImg).Error; err != nil {
	// 			return existingProduct, fmt.Errorf("could not create updated product images")
	// 		}
	// 	}
	// }

	// if err := database.DB.Preload("Images").Where("pid = ?", productPID).First(&existingProduct).Error; err != nil {
	// 	return existingProduct, fmt.Errorf("error reloading product")
	// }

	return models.Product{}, nil
}

// DeleteProductService deletes a product by PID (and its related images).
func DeleteProductService(productPID string) error {
	var product models.Product
	result := database.DB.Where("pid = ?", productPID).First(&product)
	if result.Error != nil {
		return fmt.Errorf("error finding product: %w", result.Error)
	}

	// Delete product images
	if err := database.DB.Where("pid = ?", productPID).Delete(&models.ProductImage{}).Error; err != nil {
		return ErrDeleteProductImages
	}

	if err := database.DB.Where("pid = ?", productPID).Delete(&models.Product{}).Error; err != nil {
		return ErrDeleteProduct
	}

	return nil
}

func ValidCategory(category models.Category) bool {
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

// parseCategories parses a comma-separated list of category strings into a slice of valid categories.
func parseCategories(catString string) (validCats []models.Category, invalidCats []string) {
	cats := strings.Split(catString, ",")
	for _, c := range cats {
		c = strings.TrimSpace(c)
		category := models.Category(c)
		if ValidCategory(category) {
			validCats = append(validCats, category)
		} else {
			invalidCats = append(invalidCats, c)
		}
	}
	return validCats, invalidCats
}
