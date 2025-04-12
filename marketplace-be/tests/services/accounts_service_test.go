package services_test

import (
	"marketplace-be/dtos"
	"marketplace-be/models"
	"marketplace-be/services"
	"marketplace-be/test_utils"

	"testing"

	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestAccountDetailsService(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	t.Run("User Not Found", func(t *testing.T) {
		details, err := services.GetAccountDetailsService("user-uid")
		require.Nil(t, details)
		require.EqualError(t, err, services.ErrFailedFetching.Error())
	})

	t.Run("Successful Fetch", func(t *testing.T) {
		user := &models.User{
			Uid:             "user-uid",
			Email:           "details-test@ufl.edu",
			Name:            "Test User",
			DisplayName:     "TestUser123",
			Mobile:          "123-456-7890",
			DisplayImageUrl: "https://example.com/image.jpg",
		}
		db.Create(user)

		details, err := services.GetAccountDetailsService("user-uid")
		require.NoError(t, err)
		require.NotNil(t, details)
		require.Equal(t, "details-test@ufl.edu", details.Email)
		require.Equal(t, "Test User", details.Name)
		require.Equal(t, "TestUser123", details.DisplayName)
		require.Equal(t, "123-456-7890", details.Mobile)
		require.Equal(t, "https://example.com/image.jpg", details.DisplayImageUrl)
	})
}

func TestUpdateAccountDetailsService(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	// Create test user
	user := &models.User{
		Uid:         "user-uid",
		Email:       "update-test@ufl.edu",
		Name:        "Test User",
		DisplayName: "Test",
		Mobile:      "123-456-7890",
	}
	db.Create(user)

	t.Run("Email Not Matching", func(t *testing.T) {
		input := &dtos.AccountDetailsInput{
			Email:       "different@ufl.edu",
			Name:        "Updated User",
			DisplayName: "Updated Test",
			Mobile:      "987-654-3210",
		}
		err := services.UpdateAccountDetailsService(input, "user-uid")
		require.EqualError(t, err, services.ErrEmailNotMatching.Error())
	})

	t.Run("Invalid Email Format (Not UFL domain)", func(t *testing.T) {
		input := &dtos.AccountDetailsInput{
			Email:       "update-test@gmail.com",
			Name:        "Updated User",
			DisplayName: "Updated",
			Mobile:      "987-654-3210",
		}
		err := services.UpdateAccountDetailsService(input, "user-uid")
		require.EqualError(t, err, services.ErrInvalidEmailFormat.Error())
	})

	t.Run("Empty Name", func(t *testing.T) {
		input := &dtos.AccountDetailsInput{
			Email:       "update-test@ufl.edu",
			Name:        "",
			DisplayName: "Updated",
			Mobile:      "987-654-3210",
		}
		err := services.UpdateAccountDetailsService(input, "user-uid")
		require.EqualError(t, err, services.ErrEmptyName.Error())
	})

	t.Run("Empty Mobile Number", func(t *testing.T) {
		input := &dtos.AccountDetailsInput{
			Email:       "update-test@ufl.edu",
			Name:        "Updated User",
			DisplayName: "Updated",
			Mobile:      "",
		}
		err := services.UpdateAccountDetailsService(input, "user-uid")
		require.EqualError(t, err, services.ErrEmptyMobileNumber.Error())
	})

	t.Run("Invalid Mobile Number Format", func(t *testing.T) {
		input := &dtos.AccountDetailsInput{
			Email:       "update-test@ufl.edu",
			Name:        "Updated User",
			DisplayName: "Updated",
			Mobile:      "9876543210", // No dashes
		}
		err := services.UpdateAccountDetailsService(input, "user-uid")
		require.EqualError(t, err, services.ErrInvalidMobileNumber.Error())
	})

	t.Run("Successful Update", func(t *testing.T) {
		input := &dtos.AccountDetailsInput{
			Email:       "update-test@ufl.edu",
			Name:        "Updated User",
			DisplayName: "Updated Test",
			Mobile:      "987-654-3210",
		}
		err := services.UpdateAccountDetailsService(input, "user-uid")
		require.NoError(t, err)

		var updatedUser models.User
		db.Where("uid = ?", "user-uid").First(&updatedUser)
		require.Equal(t, "Updated User", updatedUser.Name)
		require.Equal(t, "Updated Test", updatedUser.DisplayName)
		require.Equal(t, "987-654-3210", updatedUser.Mobile)
	})
}

func TestUpdatePasswordService(t *testing.T) {
	// Setup test DB
	db := test_utils.SetupTestDB(t)

	// Create test user with hashed password
	password := "currentPassword"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	require.NoError(t, err)

	user := &models.User{
		Uid:          "user-uid",
		Email:        "password-test@ufl.edu",
		PasswordHash: string(hashedPassword),
	}
	db.Create(user)

	t.Run("User Not Found", func(t *testing.T) {
		input := &dtos.PasswordInput{
			CurrentPassword: "currentPassword",
			NewPassword:     "newPassword",
		}
		err := services.UpdatePasswordService(input, "user-uid-test")
		require.Error(t, err)
	})

	t.Run("Invalid Current Password", func(t *testing.T) {
		input := &dtos.PasswordInput{
			CurrentPassword: "wrongPassword",
			NewPassword:     "newPassword",
		}
		err := services.UpdatePasswordService(input, "user-uid")
		require.EqualError(t, err, services.ErrInvalidCredentials.Error())
	})

	t.Run("Same Password", func(t *testing.T) {
		input := &dtos.PasswordInput{
			CurrentPassword: "currentPassword",
			NewPassword:     "currentPassword",
		}
		err := services.UpdatePasswordService(input, "user-uid")
		require.EqualError(t, err, services.ErrSamePassword.Error())
	})

	t.Run("Successful Password Update", func(t *testing.T) {
		input := &dtos.PasswordInput{
			CurrentPassword: "currentPassword",
			NewPassword:     "newPassword",
		}
		err := services.UpdatePasswordService(input, "user-uid")
		require.NoError(t, err)

		// Verify password has been updated
		var updatedPasswordHash string
		db.Model(&models.User{}).
			Select("password_hash").
			Where("email = ?", "password-test@ufl.edu").
			Take(&updatedPasswordHash)

		// Check if new password matches the updated hash
		err = bcrypt.CompareHashAndPassword([]byte(updatedPasswordHash), []byte("newPassword"))
		require.NoError(t, err)
	})
}
