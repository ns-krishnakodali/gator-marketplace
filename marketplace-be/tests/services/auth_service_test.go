package services

import (
	"marketplace-be/dtos"
	"marketplace-be/models"
	"marketplace-be/services"
	"marketplace-be/tests"

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
	db := tests.SetupTestDB(t)

	// Create test user
	user := &models.User{
		Uid:          "211234-4312-38913891",
		Email:        "test@example.com",
		PasswordHash: "$2a$10$examplehashedpassword", // a valid hashed password
	}
	db.Create(user)

	t.Run("User Not Found", func(t *testing.T) {
		token, err := services.LoginService(&dtos.LoginInput{Email: "nonexistent@example.com", Password: "password"})
		require.Empty(t, token)
		require.EqualError(t, err, services.ErrUserNotFound.Error())
	})

	t.Run("Invalid Credentials", func(t *testing.T) {
		token, err := services.LoginService(&dtos.LoginInput{Email: "test@example.com", Password: "wrongpassword"})
		require.Empty(t, token)
		require.EqualError(t, err, services.ErrInvalidCredentials.Error())
	})

	t.Run("Successful Login", func(t *testing.T) {
		password := "password"
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		require.NoError(t, err)

		user := &models.User{
			Email:        "login-test@ufl.edu",
			Uid:          "211234-4312-38913892",
			PasswordHash: string(hashedPassword),
		}
		db.Create(user)

		token, err := services.LoginService(&dtos.LoginInput{Email: "login-test@ufl.edu", Password: "password"})
		require.NotEmpty(t, token)
		require.NoError(t, err)
	})
}

func TestSignupService(t *testing.T) {
	// Setup test DB
	db := tests.SetupTestDB(t)

	t.Run("Invalid Email format (empty and non ufl.edu domain)", func(t *testing.T) {
		err1 := services.SignupService(&dtos.SignupInput{Email: "", Password: "password", Name: "Test User", Mobile: "123-456-7890"})
		require.EqualError(t, err1, services.ErrInvalidEmailFormat.Error())

		err2 := services.SignupService(&dtos.SignupInput{Email: "test@email.edu", Password: "password", Name: "Test User", Mobile: "123-456-7890"})
		require.EqualError(t, err2, services.ErrInvalidEmailFormat.Error())
	})

	t.Run("Empty User Name and mobile number", func(t *testing.T) {
		err := services.SignupService(&dtos.SignupInput{Email: "test@ufl.edu", Password: "password", Name: "", Mobile: "123-456-7890"})
		require.EqualError(t, err, services.ErrEmptyName.Error())
	})

	t.Run("Invalid mobile number (empty and incorrect format)", func(t *testing.T) {
		err1 := services.SignupService(&dtos.SignupInput{Email: "test@ufl.edu", Password: "password", Name: "Test User", Mobile: ""})
		require.EqualError(t, err1, services.ErrEmptyMobileNumber.Error())

		err2 := services.SignupService(&dtos.SignupInput{Email: "test@ufl.edu", Password: "password", Name: "Test User", Mobile: "1234567890"})
		require.EqualError(t, err2, services.ErrInvalidMobileNumber.Error())
	})

	t.Run("Email Already Exists", func(t *testing.T) {
		user := &models.User{
			Email:        "test@ufl.edu",
			PasswordHash: "$2a$10$examplehashedpassword", // a valid hashed password
		}
		db.Create(user)

		err := services.SignupService(&dtos.SignupInput{Email: "test@ufl.edu", Password: "password", Name: "Test User", Mobile: "123-456-7890"})
		require.EqualError(t, err, services.ErrEmailExists.Error())
	})

	t.Run("Successful Signup", func(t *testing.T) {
		err := services.SignupService(&dtos.SignupInput{Email: "signup-test@ufl.edu", Password: "password", Name: "Test User", Mobile: "123-456-7890"})
		require.NoError(t, err)

		var user models.User
		db.Where("email = ?", "signup-test@ufl.edu").First(&user)
		require.Equal(t, "signup-test@ufl.edu", user.Email)
		require.NotEmpty(t, user.PasswordHash)
	})
}
