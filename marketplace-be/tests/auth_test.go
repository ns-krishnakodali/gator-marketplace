package handlers_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"marketplace-be/test_utils"
	"marketplace-be/handlers"
	"marketplace-be/models"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func init() {
	// Use test mode so Gin doesn't print too much
	gin.SetMode(gin.TestMode)
}

// ===================
//    SIGNUP TESTS
// ===================

func TestSignup_Success(t *testing.T) {
	db := test_utils.SetupTestDB(t)
	_ = db // not used directly here, but ensures a fresh DB

	c, w := test_utils.CreateTestContext("POST", "/signup", []byte(`{"name":"John","email":"john@example.com","password":"123456"}`))
	handlers.Signup(c)

	require.Equal(t, http.StatusCreated, w.Code, "expected 201 Created")

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	require.Equal(t, "User created successfully", resp["message"])
}

func TestSignup_EmailAlreadyRegistered(t *testing.T) {
	db := test_utils.SetupTestDB(t)

	// First, create a user manually
	err := db.Create(&models.User{
		Name:         "Existing User",
		Email:        "exists@example.com",
		PasswordHash: "somehash",
	}).Error
	require.NoError(t, err)

	// Now attempt to sign up with same email
	c, w := test_utils.CreateTestContext("POST", "/signup", []byte(`{"name":"New User","email":"exists@example.com","password":"123456"}`))
	handlers.Signup(c)

	require.Equal(t, http.StatusConflict, w.Code, "expected 409 Conflict")

	var resp map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	require.Equal(t, "Email already registered", resp["message"])
}

func TestSignup_BadRequest_InvalidJSON(t *testing.T) {
	test_utils.SetupTestDB(t)

	// Unclosed brace => "unexpected EOF"
	c, w := test_utils.CreateTestContext("POST", "/signup", []byte(`{"invalid_json"`))
	handlers.Signup(c)

	require.Equal(t, http.StatusBadRequest, w.Code, "expected 400 BadRequest")

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)

	require.Contains(t, resp["message"], "Invalid input format")
}

func TestSignup_BadRequest_Validation(t *testing.T) {
	test_utils.SetupTestDB(t)

	// Missing "password" field
	c, w := test_utils.CreateTestContext("POST", "/signup", []byte(`{"name":"John","email":"john@example.com"}`))
	handlers.Signup(c)

	require.Equal(t, http.StatusBadRequest, w.Code, "expected 400 BadRequest")

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	require.Contains(t, resp["message"], "Invalid input format")
}

// ===================
//     LOGIN TESTS
// ===================

func TestLogin_Success(t *testing.T) {
	_ = test_utils.SetupTestDB(t)

	// Create a user with a known password hash
	// We'll let the actual bcrypt hashing happen inside Signup
	// or do it manually if you prefer. Let's do it with the Signup handler
	signupContext, signupWriter := test_utils.CreateTestContext("POST", "/signup", []byte(`{"name":"Test User","email":"login@example.com","password":"testpass"}`))
	handlers.Signup(signupContext)
	require.Equal(t, http.StatusCreated, signupWriter.Code)

	// Now test login
	c, w := test_utils.CreateTestContext("POST", "/login", []byte(`{"email":"login@example.com","password":"testpass"}`))
	handlers.Login(c)

	require.Equal(t, http.StatusOK, w.Code, "expected 200 OK")

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	require.Contains(t, resp, "token", "response should contain a token")
	require.NotEmpty(t, resp["token"], "token should not be empty")
}

func TestLogin_UserNotFound(t *testing.T) {
	test_utils.SetupTestDB(t)

	c, w := test_utils.CreateTestContext("POST", "/login", []byte(`{"email":"nope@example.com","password":"pass"}`))
	handlers.Login(c)

	require.Equal(t, http.StatusNotFound, w.Code, "expected 404 NotFound")

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	require.Equal(t, "Invalid credentials, try again", resp["message"])
}

func TestLogin_InvalidCredentials(t *testing.T) {
	_ = test_utils.SetupTestDB(t)

	// Create a user with a valid hash using Signup
	signupContext, signupWriter := test_utils.CreateTestContext("POST", "/signup", []byte(`{"name":"Test User","email":"wrongpass@example.com","password":"realpass"}`))
	handlers.Signup(signupContext)
	require.Equal(t, http.StatusCreated, signupWriter.Code)

	// Attempt to login with the wrong password
	c, w := test_utils.CreateTestContext("POST", "/login", []byte(`{"email":"wrongpass@example.com","password":"badpass"}`))
	handlers.Login(c)

	require.Equal(t, http.StatusUnauthorized, w.Code, "expected 401 Unauthorized")

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)
	require.Equal(t, "Invalid credentials, try again", resp["message"])
}

func TestLogin_BadRequest_InvalidJSON(t *testing.T) {
	test_utils.SetupTestDB(t)

	// Unclosed JSON => "unexpected EOF"
	invalidJSON := []byte(`{"email":"some@example.com", "password":"abc123"`)
	c, w := test_utils.CreateTestContext("POST", "/login", invalidJSON)
	handlers.Login(c)

	require.Equal(t, http.StatusBadRequest, w.Code, "expected 400 BadRequest")

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)

	require.Contains(t, resp["message"], "Invalid input format")
}
