package services

import (
	"log"
	"strings"

	"marketplace-be/database"
	"marketplace-be/models"
)

func AccountDetailsService(userEmail string) (*models.AccountDetails, error) {
	var details models.AccountDetails

	result := database.DB.
		Table("users").
		Select("image_url, name, display_name, email, mobile").
		Where("email = ?", userEmail).
		First(&details)

	if result.Error != nil {
		log.Printf("Error fetching user details for userID %s: %v", userEmail, result.Error)
		return nil, ErrFailedFetching
	}

	return &details, nil
}

func UpdateAccountDetailsService(input *models.AccountDetailsInput, email string) error {
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
		Where("email = ?", email).
		Updates(newUser).Error

	if err != nil {
		log.Printf("Failed to update user details for email %s: %v", email, err)
		return err
	}

	return nil
}

func validateAccountDetailsInput(input *models.AccountDetailsInput, email string) error {
	switch {
	case input.Email != email:
		return ErrEmailNotMatching
	case validateUFLEmail(input.Email) != nil:
		return validateUFLEmail(input.Email)
	case strings.TrimSpace(input.Name) == "":
		return ErrEmptyName
	case strings.TrimSpace(input.Mobile) == "":
		return ErrEmptyMobileNumber
	case validateMobileNumber(input.Mobile) != nil:
		return validateMobileNumber(input.Mobile)
	}
	return nil
}
