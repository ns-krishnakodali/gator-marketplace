package database

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	err := godotenv.Load()
	if err != nil {
		log.Printf("Error loading .env file")
	}

	// Get the connection string directly from the environment variable
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Printf("DATABASE_URL environment variable not set")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	DB = db
	log.Println("Connected to the database successfully!")

	MigrateDB()
}
