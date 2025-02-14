package database

import (
	"log"

	"marketplace-be/models"
)

func MigrateDB() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.ProductImage{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database migration successful: All tables are ready.")
}
