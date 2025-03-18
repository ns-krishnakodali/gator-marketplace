package services

import (
	"log"
	"strings"

	"marketplace-be/auth"
	"marketplace-be/database"
	"marketplace-be/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func LoginService(input *models.LoginInput) (string, error) {
	var user models.User

	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return "", ErrUserNotFound
	}

	// Compare stored hashed password with provided password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return "", ErrInvalidCredentials
	}

	token, err := auth.GenerateToken(user.Email)
	if err != nil {
		return "", ErrTokenGeneration
	}

	return token, nil
}

func SignupService(input *models.SignupInput) error {
	var user models.User

	if err := validateUserDetails(input); err != nil {
		return err
	}

	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err == nil {
		log.Printf("Attempted signup with already registered email: %s", input.Email)
		return ErrEmailExists
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return ErrHashingPassword
	}

	userUid := uuid.New().String()

	newUser := models.User{
		Name:         input.Name,
		DisplayName:  sanitizeString(DpPrefix + userUid[:6]),
		Uid:          userUid,
		Email:        input.Email,
		Mobile:       input.Mobile,
		PasswordHash: string(hashedPassword),
	}

	if err := database.DB.Create(&newUser).Error; err != nil {
		log.Printf("Error creating user: %v", err)
		return err
	}

	return nil
}

func validateUserDetails(input *models.SignupInput) error {
	switch {
	case !validateUFLEmail(input.Email):
		return ErrInvalidEmailFormat
	case strings.TrimSpace(input.Name) == "":
		return ErrEmptyName
	case strings.TrimSpace(input.Mobile) == "":
		return ErrEmptyMobileNumber
	case !validateMobileNumber(input.Mobile):
		return ErrInvalidMobileNumber
	}
	return nil
}
