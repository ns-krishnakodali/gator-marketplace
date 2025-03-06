package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"time"

	"marketplace-be/database"
	"marketplace-be/models"

	"github.com/google/uuid"
)

type Product struct {
	Images []string `json:"images"`
}

type ProductsData struct {
	Products []Product `json:"products"`
}

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

func getRandomProductImage(data ProductsData) string {
	rInt := rand.New(rand.NewSource(time.Now().UnixNano()))
	randomProduct := data.Products[rInt.Intn(len(data.Products))]

	if len(randomProduct.Images) > 0 {
		return randomProduct.Images[rand.Intn(len(randomProduct.Images))]
	}

	return "https://placehold.co/600x400"
}

func GenerateMockProductsData(numProducts int) {
	file, err := os.ReadFile("scripts/mock-products.json")
	if err != nil {
		fmt.Printf("Error reading JSON file: %v\n", err)
		file = []byte(`{"products":[]}`)
	}

	var data ProductsData
	if err := json.Unmarshal(file, &data); err != nil {
		fmt.Printf("Error parsing JSON: %v\n", err)
	}

	for i := range numProducts {
		product_uuid := uuid.New().String()
		category := categories[rand.Intn(len(categories))]

		product := models.Product{
			Pid:             product_uuid,
			Name:            fmt.Sprintf("%s-product %d", category, i+1),
			Description:     fmt.Sprintf("This is a sample description for product %d", i+1),
			Price:           float64(rand.Intn(10000)) / 100,
			Category:        category,
			Quantity:        rand.Intn(100) + 1,
			PopularityScore: float64(rand.Intn(1000)) / 100,
		}

		fmt.Printf("%s\n", product_uuid)
		if err := database.DB.Create(&product).Error; err != nil {
			fmt.Printf("Error creating product: %v\n", err)
			continue
		}

		// Get a random image from the mock JSON
		imageURL := getRandomProductImage(data)

		productImage := models.ProductImage{
			Pid:      product_uuid,
			Url:      imageURL,
			MimeType: "image/jpeg",
			IsMain:   true,
		}

		if err := database.DB.Create(&productImage).Error; err != nil {
			fmt.Printf("Error creating product image: %v\n", err)
		}
	}
}

func main() {
	database.ConnectDatabase()
	if database.DB == nil {
		fmt.Println("Error: Database connection is not initialized.")
		return
	}

	fmt.Println("Generating mock products data...")
	GenerateMockProductsData(100)
	fmt.Println("Mock data generation complete.")
}
