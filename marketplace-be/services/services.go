package services

import (
	"errors"
	"regexp"
	"strings"
)

var DpPrefix = "GatorUser"

var ErrUserNotFound = errors.New("user not found")
var ErrInvalidCredentials = errors.New("invalid credentials")
var ErrTokenGeneration = errors.New("token generation error")
var ErrEmailExists = errors.New("email exists")
var ErrHashingPassword = errors.New("hash password error")
var ErrFailedFetching = errors.New("failed to fetch account details")
var ErrEmailNotMatching = errors.New("email not matching the given input")
var ErrEmptyName = errors.New("name in user input is empty")
var ErrEmptyMobileNumber = errors.New("mobile number in user input is empty")
var ErrInvalidEmailFormat = errors.New("invalid email format, must be a ufl.edu email")
var ErrInvalidMobileNumber = errors.New("invalid mobile number format, must be xxx-xxx-xxxx")
var ErrSamePassword = errors.New("passwords are same")

var ErrProductNotFound = errors.New("product not found")
var ErrInsufficientProductQuantity = errors.New("insufficient product quantity")
var ErrCartItemNotFound = errors.New("cart item not found")

func validateUFLEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@ufl.edu$`)
	return re.MatchString(email)
}

func validateMobileNumber(mobileNumber string) bool {
	re := regexp.MustCompile(`^\d{3}-\d{3}-\d{4}$`)
	return re.MatchString(mobileNumber)
}

func sanitizeString(s string) string {
	s = strings.ReplaceAll(s, " ", "_")
	return strings.ReplaceAll(s, "-", "_")
}
