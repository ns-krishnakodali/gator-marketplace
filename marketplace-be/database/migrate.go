package database

import (
	"log"

	"marketplace-be/models"
)

func MigrateDB() {
	err := DB.AutoMigrate(
		&models.CartProduct{},
		&models.Order{},
		&models.Product{},
		&models.ProductImage{},
		&models.User{},
	)
	if err != nil {
		log.Printf("Failed to migrate database: %v", err)
	}
	log.Println("Database migration successful: All tables are ready.")
}
