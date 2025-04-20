package tests

import (
	"bytes"
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
		&models.CartProduct{},
		&models.Order{},
		&models.Product{},
		&models.ProductImage{},
		&models.User{},
	)
	if err != nil {
		t.Fatalf("AutoMigrate failed: %v", err)
	}

	require.NoError(t, err, "failed to auto-migrate")
	require.True(t, db.Migrator().HasTable(&models.Product{}), "products table not created")
	require.True(t, db.Migrator().HasColumn(&models.Product{}, "PID"), "PID column not created")

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
func SetUserContext(c *gin.Context, userEmail string) {
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	claims := jwt.MapClaims{
		"user_email": userEmail,
		"exp":        time.Now().Add(time.Hour * 1).Unix(), // 1-hour expiration
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		panic("failed to sign JWT in test: " + err.Error())
	}

	c.Request.Header.Set("Authorization", tokenString)
}
