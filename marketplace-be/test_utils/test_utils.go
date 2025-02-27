package test_utils

import (
	"bytes"
	"net/http/httptest"
	"testing"

	"marketplace-be/models"

	"marketplace-be/database"

	"github.com/gin-gonic/gin"
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
		&models.ProductImage{})
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
