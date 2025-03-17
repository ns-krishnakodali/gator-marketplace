package handlers_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"marketplace-be/handlers"
	"marketplace-be/models"
	"marketplace-be/test_utils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func init() {
	// Use test mode so Gin doesn't print too much
	gin.SetMode(gin.TestMode)
}

func TestLoginHandler(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	// Prepare test data
	user := &models.User{
		Email:        "test@example.com",
		PasswordHash: "$2a$10$examplehashedpassword",
	}
	db.Create(user)

	t.Run("Invalid Input", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("POST", "/login", []byte(`{"email":""}`))
		handlers.Login(c)
		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "Invalid input format")
	})

	t.Run("User Not Found", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("POST", "/login", []byte(`{"email":"nonexistent@example.com","password":"password"}`))
		handlers.Login(c)
		require.Equal(t, http.StatusNotFound, w.Code)
		require.Contains(t, w.Body.String(), "Invalid credentials, try again")
	})

	t.Run("Invalid Credentials", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("POST", "/login", []byte(`{"email":"test@example.com","password":"wrongpassword"}`))
		handlers.Login(c)
		require.Equal(t, http.StatusUnauthorized, w.Code)
		require.Contains(t, w.Body.String(), "Invalid credentials, try again")
	})

	t.Run("Successful Login", func(t *testing.T) {
		signupContext, signupWriter := test_utils.CreateTestContext("POST", "/signup", []byte(
			`{"name":"Test User","email":"login@ufl.edu","mobile": "123-456-7890","password":"testpass"}`))

		handlers.Signup(signupContext)
		require.Equal(t, http.StatusCreated, signupWriter.Code)

		c, w := test_utils.CreateTestContext("POST", "/login", []byte(`{"email":"login@ufl.edu","password":"testpass"}`))
		handlers.Login(c)

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)
		require.Contains(t, resp, "token", "response should contain a token")
		require.NotEmpty(t, resp["token"], "token should not be empty")
	})
}

func TestSignupHandler(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	t.Run("Invalid Input", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("POST", "/signup", []byte(`{"email":"test@example.com"}`)) // Missing 'password' and 'name'
		handlers.Signup(c)

		require.Equal(t, http.StatusBadRequest, w.Code, "expected 400 BadRequest")
		require.Contains(t, w.Body.String(), "Invalid input format")
	})

	t.Run("Invalid user email (non ufl domain)", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("POST", "/signup", []byte(
			`{"email":"existing@email.com","password":"password","name":"New User","mobile":"123-456-7890"}`))
		handlers.Signup(c)

		require.Equal(t, http.StatusUnprocessableEntity, w.Code, "expected 422 BadRequest")
		require.Contains(t, w.Body.String(), "Invalid email format. Please enter valid UFL email.")
	})

	t.Run("Invalid user mobile number", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("POST", "/signup", []byte(
			`{"email":"existing@ufl.edu","password":"password","name":"New User","mobile":"123-4567890"}`))

		handlers.Signup(c)

		require.Equal(t, http.StatusUnprocessableEntity, w.Code, "expected 422 BadRequest")
		require.Contains(t, w.Body.String(), "Invalid mobile number. Please follow xxx-xxx-xxxx format.")
	})

	t.Run("Email Already Registered", func(t *testing.T) {
		// Create a user for testing
		user := &models.User{
			Email:        "existing@ufl.edu",
			PasswordHash: "$2a$10$hashedpassword", // a valid hashed password
		}
		db.Create(user)

		c, w := test_utils.CreateTestContext("POST", "/signup", []byte(
			`{"email":"existing@ufl.edu","password":"password","name":"Test User","mobile":"123-456-7890"}`))

		handlers.Signup(c)
		require.Equal(t, http.StatusConflict, w.Code)
		require.Contains(t, w.Body.String(), "Email already registered")
	})

	t.Run("Successful Signup", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("POST", "/signup", []byte(
			`{"email":"signup@ufl.edu","password":"password","name":"New User","mobile":"123-456-7899"}`))

		handlers.Signup(c)
		require.Equal(t, http.StatusCreated, w.Code)
		require.Contains(t, w.Body.String(), "User created successfully")
	})
}
