package services

import (
	"log"

	"marketplace-be/auth"
	"marketplace-be/database"
	"marketplace-be/models"

	"golang.org/x/crypto/bcrypt"
)

func LoginService(input *models.LoginInput) (string, error) {
	var user models.User
	// Check if the user exists in the database
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return "", errorString("user_not_found")
	}

	// Compare stored hashed password with provided password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return "", errorString("invalid_credentials")
	}

	// Generate authentication token
	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		return "", errorString("token_error")
	}

	return token, nil
}

func SignupService(input *models.SignupInput) error {
	var user models.User

	// Check if the email is already registered
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err == nil {
		return errorString("email_exists")
	}

	// Hash the user's password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return errorString("hash_error")
	}

	newUser := models.User{
		Name:         input.Name,
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

// errorString is a custom error type
type errorString string

func (e errorString) Error() string {
	return string(e)
}
