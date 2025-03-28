package test_utils

import (
	"bytes"
	"fmt"
	"net/http/httptest"
	"os"
	"testing"

	"marketplace-be/models"

	"marketplace-be/database"

	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestDB creates a new in-memory SQLite DB, migrates the schema, and
// returns the *gorm.DB instance. We then assign it to database.DB so that
// the handlers use this fresh DB for each test.
func SetupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err, "failed to open in-memory sqlite")

	err = db.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.ProductImage{},
		&models.CartItem{},
	)
	if err != nil {
		t.Fatalf("AutoMigrate failed: %v", err)
	}

	require.NoError(t, err, "failed to auto-migrate")
	// Optional checks
	require.True(t, db.Migrator().HasTable(&models.Product{}), "products table not created")
	require.True(t, db.Migrator().HasColumn(&models.Product{}, "PID"), "PID column not created")

	// Assign the global DB pointer to this in-memory DB for the handlers
	database.DB = db
	return db
}

// helper to quickly create an HTTP test request and context
func CreateTestContext(method, path string, body []byte) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	req := httptest.NewRequest(method, path, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	return c, w
}

// SetUserContext creates a valid JWT using the same JWT_SECRET
// as your production code, then sets the Authorization header.
func SetUserContext(c *gin.Context, userEmail string) {
	// Read secret from env
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))

	// Or, if you have a global variable loaded from env already (e.g. auth.JwtSecret),
	// you can just reuse that. The key point is to sign with the same secret.

	// Create real JWT claims
	claims := jwt.MapClaims{
		"user_email": userEmail,
		"exp":        time.Now().Add(time.Hour * 1).Unix(), // 1-hour expiration
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token
	tokenString, err := token.SignedString(jwtSecret)
	fmt.Println("DEBUG token:", tokenString, "err:", err)
	if err != nil {
		// In tests, you could panic or handle the error however you'd like
		panic("failed to sign JWT in test: " + err.Error())
	}

	// Set Authorization header to "Bearer <token>"
	c.Request.Header.Set("Authorization", tokenString)
}
