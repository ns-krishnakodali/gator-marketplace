package handlers_test

import (
	"encoding/json"
	"marketplace-be/auth"
	"marketplace-be/handlers"
	"marketplace-be/models"
	"marketplace-be/tests"

	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func init() {
	// Use test mode so Gin doesn't print too much
	gin.SetMode(gin.TestMode)
}

func TestGetAccountDetails(t *testing.T) {
	db := tests.SetupTestDB(t)

	// Prepare test user
	user := &models.User{
		ID:              1,
		Uid:             "user-uid",
		Email:           "test@ufl.edu",
		DisplayImageUrl: "https://displayimage",
		Name:            "Test User",
		DisplayName:     "GatorUser",
		Mobile:          "123-456-7890",
		PasswordHash:    "$2a$10$examplehashedpassword",
	}
	db.Create(user)

	// Create test token
	token, _ := auth.GenerateToken(user.Uid)

	t.Run("User Not Found", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/account", nil)
		c.Request.Header.Set("Authorization", token+"invalid")

		handlers.GetAccountDetails(c)
		require.Equal(t, http.StatusNotFound, w.Code)
		require.Contains(t, w.Body.String(), "User account not found")
	})

	t.Run("Successful Get Account Details", func(t *testing.T) {
		c, w := tests.CreateTestContext("GET", "/api/account", nil)
		c.Request.Header.Set("Authorization", token)

		handlers.GetAccountDetails(c)

		require.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)

		accountDetails, exists := resp["accountDetails"].(map[string]interface{})
		require.True(t, exists)
		require.Equal(t, "Test User", accountDetails["name"])
		require.Equal(t, "test@ufl.edu", accountDetails["email"])
		require.Equal(t, "123-456-7890", accountDetails["mobile"])
	})
}

func TestUpdateAccountDetailsHandler(t *testing.T) {
	// Setup test DB
	db := tests.SetupTestDB(t)

	// Prepare test user
	user := &models.User{
		ID:              1,
		Uid:             "user-uid",
		Email:           "test@ufl.edu",
		DisplayImageUrl: "",
		Name:            "Test User",
		DisplayName:     "GatorUser",
		Mobile:          "123-456-7890",
		PasswordHash:    "$2a$10$examplehashedpassword",
	}
	db.Create(user)

	// Create test token
	token, _ := auth.GenerateToken(user.Uid)

	t.Run("Invalid Input Format", func(t *testing.T) {
		c, w := tests.CreateTestContext("PUT", "/api/update-account", []byte(`{"name":""}`))
		c.Request.Header.Set("Authorization", token)

		handlers.UpdateAccountDetails(c)
		require.Equal(t, http.StatusBadRequest, w.Code)
		require.Contains(t, w.Body.String(), "Invalid input format")
	})

	t.Run("Invalid Email Format", func(t *testing.T) {
		c, w := tests.CreateTestContext("PUT", "/api/update-account", []byte(
			`{"name":"Test User","email":"test@email.com","displayName":"GatorUser","mobile":"123-456-7890"}`))
		c.Request.Header.Set("Authorization", token)

		handlers.UpdateAccountDetails(c)
		require.Equal(t, http.StatusUnprocessableEntity, w.Code)
		require.Contains(t, w.Body.String(), "nvalid email format, please enter valid UFL email")
	})

	t.Run("Invalid Mobile Number Format", func(t *testing.T) {
		c, w := tests.CreateTestContext("PUT", "/api/update-account", []byte(
			`{"name":"Test Name","email":"test@ufl.edu","displayName":"GatorUser","mobile":"1234567890"}`))
		c.Request.Header.Set("Authorization", token)

		handlers.UpdateAccountDetails(c)
		require.Equal(t, http.StatusUnprocessableEntity, w.Code)
		require.Contains(t, w.Body.String(), "Invalid mobile number, please follow xxx-xxx-xxxx format")
	})

	t.Run("Successful Update", func(t *testing.T) {
		c, w := tests.CreateTestContext("PUT", "/account", []byte(
			`{"name":"New Name","email":"test@ufl.edu","displayName":"GatorUser","mobile":"987-654-3210"}`))
		c.Request.Header.Set("Authorization", token)

		handlers.UpdateAccountDetails(c)
		require.Equal(t, http.StatusNoContent, w.Code)

		// Verify the update in the database
		var updatedUser models.User
		db.Where("email = ?", "test@ufl.edu").First(&updatedUser)
		require.Equal(t, "New Name", updatedUser.Name)
		require.Equal(t, "987-654-3210", updatedUser.Mobile)
	})
}
