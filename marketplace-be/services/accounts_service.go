package services

import (
	"log"
	"strings"

	"marketplace-be/database"
	"marketplace-be/models"

	"golang.org/x/crypto/bcrypt"
)

func GetAccountDetailsService(userUid string) (*models.AccountDetailsResponse, error) {
	var details models.AccountDetailsResponse

	result := database.DB.
		Table("users").
		Select("display_image_url, name, display_name, email, mobile").
		Where("uid = ?", userUid).
		First(&details)

	if result.Error != nil {
		log.Printf("Error fetching user details for userID %s: %v", userUid, result.Error)
		return nil, ErrFailedFetching
	}

	return &details, nil
}

func UpdateAccountDetailsService(input *models.AccountDetailsInput, userUid string) error {
	var email string
	if err := database.DB.
		Model(&models.User{}).
		Select("email").
		Where("uid = ?", userUid).
		Take(&email).Error; err != nil {
		log.Printf("Error fetching email for uid %s: %v", userUid, err)
		return err
	}

	if err := validateAccountDetailsInput(input, email); err != nil {
		return err
	}

	newUser := models.User{
		Name:        input.Name,
		DisplayName: input.DisplayName,
		Email:       input.Email,
		Mobile:      input.Mobile,
	}

	err := database.DB.Model(&models.User{}).
		Where("uid = ?", userUid).
		Updates(newUser).Error

	if err != nil {
		log.Printf("Failed to update user details for email %s: %v", email, err)
		return err
	}

	return nil
}

func UpdatePasswordService(input *models.PasswordInput, userUid string) error {
	var hashedPassword string

	if err := database.DB.
		Model(&models.User{}).
		Select("password_hash").
		Where("uid = ?", userUid).
		Take(&hashedPassword).Error; err != nil {
		log.Printf("Error finding user with uid %s: %v", userUid, err)
		return err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(input.CurrentPassword)); err != nil {
		return ErrInvalidCredentials
	}

	if input.CurrentPassword == input.NewPassword {
		return ErrSamePassword
	}

	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return ErrHashingPassword
	}

	// Update password in a single query
	if err := database.DB.
		Model(&models.User{}).
		Where("uid = ?", userUid).
		Update("password_hash", string(newHashedPassword)).Error; err != nil {
		log.Printf("Error updating password: %v", err)
		return err
	}

	return nil
}

func validateAccountDetailsInput(input *models.AccountDetailsInput, email string) error {
	switch {
	case !validateUFLEmail(input.Email):
		return ErrInvalidEmailFormat
	case input.Email != email:
		return ErrEmailNotMatching
	case strings.TrimSpace(input.Name) == "":
		return ErrEmptyName
	case strings.TrimSpace(input.Mobile) == "":
		return ErrEmptyMobileNumber
	case !validateMobileNumber(input.Mobile):
		return ErrInvalidMobileNumber
	}
	return nil
}
