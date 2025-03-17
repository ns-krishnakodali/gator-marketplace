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

func validateUFLEmail(email string) error {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@ufl.edu$`)
	if !re.MatchString(email) {
		return ErrInvalidEmailFormat
	}
	return nil
}

func validateMobileNumber(mobileNumber string) error {
	re := regexp.MustCompile(`^\d{3}-\d{3}-\d{4}$`)
	if !re.MatchString(mobileNumber) {
		return ErrInvalidMobileNumber
	}
	return nil
}

func sanitizeString(s string) string {
	s = strings.ReplaceAll(s, " ", "_")
	return strings.ReplaceAll(s, "-", "_")
}
