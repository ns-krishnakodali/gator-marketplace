package scripts

import (
	"fmt"
	"math/rand"

	"marketplace-be/database"
	"marketplace-be/models"

	"github.com/google/uuid"
)

var categories = []models.Category{
	models.Electronics,
	models.Books,
	models.Clothing,
	models.Furniture,
	models.Tickets,
	models.Sports,
	models.Appliances,
	models.Miscellaneous,
}

func GenerateMockProductsData(numProducts int) {
	for i := 0; i < numProducts; i++ {
		product_uuid := uuid.New().String()
		product := models.Product{
			PID:             product_uuid,
			Name:            fmt.Sprintf("Product %d", i+1),
			Description:     fmt.Sprintf("This is a sample description for product %d", i+1),
			Price:           float64(rand.Intn(10000)) / 100,
			Category:        categories[rand.Intn(len(categories))],
			Quantity:        rand.Intn(100) + 1,
			PopularityScore: float64(rand.Intn(1000)) / 100,
		}

		if err := database.DB.Create(&product).Error; err != nil {
			fmt.Printf("Error creating product: %v\n", err)
			continue
		}

		mockImageData := []byte("mock image data for testing purposes")
		productImage := models.ProductImage{
			PID:      product_uuid,
			Data:     mockImageData,
			MimeType: "image/jpeg",
			IsMain:   true,
		}

		if err := database.DB.Create(&productImage).Error; err != nil {
			fmt.Printf("Error creating product image: %v\n", err)
		}
	}
}
