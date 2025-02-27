package main

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
		fmt.Printf("%s\n", product_uuid)
		product := models.Product{
			Pid:             product_uuid,
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

		productImage := models.ProductImage{
			Pid:      product_uuid,
			Url:	  "https://placehold.co/600x400",
			MimeType: "image/jpeg",
			IsMain:   true,
		}

		if err := database.DB.Create(&productImage).Error; err != nil {
			fmt.Printf("Error creating product image: %v\n", err)
		}
	}
}

// Add a `main` function to call `GenerateMockProductsData`
func main() {
		// Ensure database is initialized
	database.ConnectDatabase()

	// Verify that the DB connection is valid before proceeding
	if database.DB == nil {
		fmt.Println("Error: Database connection is not initialized.")
		return
	}

	fmt.Println("Generating mock products data...")
	GenerateMockProductsData(1000) // Adjust the number as needed
	fmt.Println("Mock data generation complete.")

}