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
		signupContext, signupWriter := test_utils.CreateTestContext("POST", "/signup", []byte(`{"name":"Test User","email":"login@example.com","password":"testpass"}`))
		handlers.Signup(signupContext)
		require.Equal(t, http.StatusCreated, signupWriter.Code)

		c, w := test_utils.CreateTestContext("POST", "/login", []byte(`{"email":"login@example.com","password":"testpass"}`))
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

		var resp map[string]any
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		require.Contains(t, resp["message"], "Invalid input format")
	})

	t.Run("Email Already Registered", func(t *testing.T) {
		// Create a user for testing
		user := &models.User{
			Email:        "existing@example.com",
			PasswordHash: "$2a$10$hashedpassword", // a valid hashed password
		}
		db.Create(user)

		c, w := test_utils.CreateTestContext("POST", "/signup", []byte(`{"email":"existing@example.com","password":"password","name":"Test User"}`))
		handlers.Signup(c)
		require.Equal(t, http.StatusConflict, w.Code)
		require.Contains(t, w.Body.String(), "Email already registered")
	})

	t.Run("Successful Signup", func(t *testing.T) {
		c, w := test_utils.CreateTestContext("POST", "/signup", []byte(`{"email":"newuser@example.com","password":"password","name":"New User"}`))
		handlers.Signup(c)
		require.Equal(t, http.StatusCreated, w.Code)
		require.Contains(t, w.Body.String(), "User created successfully")
	})
}
