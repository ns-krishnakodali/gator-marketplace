package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"marketplace-be/database"
	"marketplace-be/handlers"
	"marketplace-be/models"
)

func init() {
	// Use test mode so Gin doesn't print too much
	gin.SetMode(gin.TestMode)
}

// setupTestDB creates a new in-memory SQLite DB, migrates the schema, and
// returns the *gorm.DB instance. We then assign it to database.DB so that
// the handlers use this fresh DB for each test.
func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err, "failed to open in-memory sqlite")

	// Migrate the schema needed for tests
	err = db.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.ProductImage{},
	)
	require.NoError(t, err, "failed to auto-migrate")

	// Assign the global DB pointer to this in-memory DB for the handlers
	database.DB = db
	return db
}

// helper to quickly create an HTTP test request and context
func createTestContext(method, path, body string) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	req := httptest.NewRequest(method, path, bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req
	return c, w
}

// ===================
//    SIGNUP TESTS
// ===================

func TestSignup_Success(t *testing.T) {
	db := setupTestDB(t)
	_ = db // not used directly here, but ensures a fresh DB

	c, w := createTestContext("POST", "/signup", `{"name":"John","email":"john@example.com","password":"123456"}`)
	handlers.Signup(c)

	require.Equal(t, http.StatusCreated, w.Code, "expected 201 Created")

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	require.Equal(t, "User created successfully", resp["message"])
}

func TestSignup_EmailAlreadyRegistered(t *testing.T) {
	db := setupTestDB(t)

	// First, create a user manually
	err := db.Create(&models.User{
		Name:         "Existing User",
		Email:        "exists@example.com",
		PasswordHash: "somehash",
	}).Error
	require.NoError(t, err)

	// Now attempt to sign up with same email
	c, w := createTestContext("POST", "/signup", `{"name":"New User","email":"exists@example.com","password":"123456"}`)
	handlers.Signup(c)

	require.Equal(t, http.StatusConflict, w.Code, "expected 409 Conflict")

	var resp map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	require.Equal(t, "Email already registered", resp["error"])
}

func TestSignup_BadRequest_InvalidJSON(t *testing.T) {
    setupTestDB(t)

    // Unclosed brace => "unexpected EOF"
    c, w := createTestContext("POST", "/signup", `{"invalid_json"`)
    handlers.Signup(c)

    require.Equal(t, http.StatusBadRequest, w.Code, "expected 400 BadRequest")

    var resp map[string]interface{}
    err := json.Unmarshal(w.Body.Bytes(), &resp)
    require.NoError(t, err)

    // The exact message might be "unexpected EOF" or "invalid character"
    // So you can test more generally:
    require.Contains(t, resp["error"], "unexpected EOF")
    // or
    // require.Contains(t, resp["error"], "invalid character")
}

func TestSignup_BadRequest_Validation(t *testing.T) {
	setupTestDB(t)

	// Missing "password" field
	c, w := createTestContext("POST", "/signup", `{"name":"John","email":"john@example.com"}`)
	handlers.Signup(c)

	require.Equal(t, http.StatusBadRequest, w.Code, "expected 400 BadRequest")

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	// Typically will get a validation error message like "Key: 'SignupInput.Password' Error:Field validation for 'Password' failed..."
	require.Contains(t, resp["error"], "Password")
}

// ===================
//     LOGIN TESTS
// ===================

func TestLogin_Success(t *testing.T) {
	_ = setupTestDB(t)

	// Create a user with a known password hash
	// We'll let the actual bcrypt hashing happen inside Signup
	// or do it manually if you prefer. Let's do it with the Signup handler
	signupContext, signupWriter := createTestContext("POST", "/signup", `{"name":"Test User","email":"login@example.com","password":"testpass"}`)
	handlers.Signup(signupContext)
	require.Equal(t, http.StatusCreated, signupWriter.Code)

	// Now test login
	c, w := createTestContext("POST", "/login", `{"email":"login@example.com","password":"testpass"}`)
	handlers.Login(c)

	require.Equal(t, http.StatusOK, w.Code, "expected 200 OK")

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	require.Contains(t, resp, "token", "response should contain a token")
	require.NotEmpty(t, resp["token"], "token should not be empty")
}

func TestLogin_UserNotFound(t *testing.T) {
	setupTestDB(t)

	c, w := createTestContext("POST", "/login", `{"email":"nope@example.com","password":"pass"}`)
	handlers.Login(c)

	require.Equal(t, http.StatusNotFound, w.Code, "expected 404 NotFound")

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	require.Equal(t, "User not found", resp["error"])
}

func TestLogin_InvalidCredentials(t *testing.T) {
	_ = setupTestDB(t)

	// Create a user with a valid hash using Signup
	signupContext, signupWriter := createTestContext("POST", "/signup", `{"name":"Test User","email":"wrongpass@example.com","password":"realpass"}`)
	handlers.Signup(signupContext)
	require.Equal(t, http.StatusCreated, signupWriter.Code)

	// Attempt to login with the wrong password
	c, w := createTestContext("POST", "/login", `{"email":"wrongpass@example.com","password":"badpass"}`)
	handlers.Login(c)

	require.Equal(t, http.StatusUnauthorized, w.Code, "expected 401 Unauthorized")

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	require.Equal(t, "Invalid credentials", resp["error"])
}

func TestLogin_BadRequest_InvalidJSON(t *testing.T) {
    setupTestDB(t)

    // Unclosed JSON => "unexpected EOF"
    invalidJSON := `{"email":"some@example.com", "password":"abc123"`
    c, w := createTestContext("POST", "/login", invalidJSON)
    handlers.Login(c)

    require.Equal(t, http.StatusBadRequest, w.Code, "expected 400 BadRequest")

    var resp map[string]interface{}
    err := json.Unmarshal(w.Body.Bytes(), &resp)
    require.NoError(t, err)

    // Check for "unexpected EOF" (or at least confirm it's an error about malformed JSON)
    require.Contains(t, resp["error"], "unexpected EOF")
}
