package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"strings"
	"time"

	"marketplace-be/database"
	"marketplace-be/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
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

func sanitizeString(s string) string {
	s = strings.ReplaceAll(s, " ", "_")
	return strings.ReplaceAll(s, "-", "_")
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

	userUid := uuid.New().String()
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("mocktestpassword"), bcrypt.DefaultCost)
	mockUser := models.User{
		Name:         "MockUser",
		DisplayName:  sanitizeString("GatorUser" + userUid[:6]),
		Uid:          userUid,
		Email:        "mock-test@ufl.edu",
		Mobile:       "289-128-9342",
		PasswordHash: string(hashedPassword),
	}

	if err := database.DB.Create(&mockUser).Error; err != nil {
		fmt.Printf("Error creating mock user: %v\n", err)
		return
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
			PostedBy:        mockUser,
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
