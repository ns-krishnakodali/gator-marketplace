package services

import (
	"marketplace-be/models"
	"marketplace-be/services"
	"marketplace-be/test_utils"

	"testing"

	"golang.org/x/crypto/bcrypt"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

type MockBcrypt struct {
	mock.Mock
}

func (m *MockBcrypt) CompareHashAndPassword(hashedPassword, password []byte) error {
	args := m.Called(hashedPassword, password)
	return args.Error(0)
}

func (m *MockBcrypt) GenerateFromPassword(password []byte, cost int) ([]byte, error) {
	args := m.Called(password, cost)
	return args.Get(0).([]byte), args.Error(1)
}

func TestLoginService(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	// Create test user
	user := &models.User{
		Email:        "test@example.com",
		PasswordHash: "$2a$10$examplehashedpassword", // a valid hashed password
	}
	db.Create(user)

	t.Run("User Not Found", func(t *testing.T) {
		token, err := services.LoginService(&models.LoginInput{Email: "nonexistent@example.com", Password: "password"})
		require.Empty(t, token)
		require.EqualError(t, err, "user_not_found")
	})

	t.Run("Invalid Credentials", func(t *testing.T) {
		token, err := services.LoginService(&models.LoginInput{Email: "test@example.com", Password: "wrongpassword"})
		require.Empty(t, token)
		require.EqualError(t, err, "invalid_credentials")
	})

	t.Run("Successful Login", func(t *testing.T) {
		password := "password"
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		require.NoError(t, err)

		user := &models.User{
			Email:        "login-test@example.com",
			PasswordHash: string(hashedPassword),
		}
		db.Create(user)

		token, err := services.LoginService(&models.LoginInput{Email: "login-test@example.com", Password: "password"})
		require.NotEmpty(t, token)
		require.NoError(t, err)
	})
}

func TestSignupService(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	t.Run("Email Already Exists", func(t *testing.T) {
		user := &models.User{
			Email:        "test@example.com",
			PasswordHash: "$2a$10$examplehashedpassword", // a valid hashed password
		}
		db.Create(user)

		err := services.SignupService(&models.SignupInput{Email: "test@example.com", Password: "password", Name: "Test User"})
		require.EqualError(t, err, "email_exists")
	})

	t.Run("Successful Signup", func(t *testing.T) {
		err := services.SignupService(&models.SignupInput{Email: "signup-test@example.com", Password: "password", Name: "Test User"})
		require.NoError(t, err)

		var user models.User
		db.Where("email = ?", "signup-test@example.com").First(&user)
		require.Equal(t, "signup-test@example.com", user.Email)
		require.NotEmpty(t, user.PasswordHash)
	})
}
