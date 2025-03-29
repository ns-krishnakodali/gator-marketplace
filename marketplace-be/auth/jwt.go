package auth

import (
	"errors"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func GenerateToken(userEmail string) (string, error) {
	minutes, err := strconv.Atoi(os.Getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
	if err != nil {
		minutes = 60 // Default to 60 minutes if not set
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_email": userEmail,
		"exp":        time.Now().Add(time.Minute * time.Duration(minutes)).Unix(),
	})
	return token.SignedString(jwtSecret)
}

func ExtractUserID(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return "", err
	}
	if !token.Valid {
		return "", errors.New("token invalid")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", jwt.ErrInvalidKey
	}

	userEmail, ok := claims["user_email"].(string)
	if !ok {
		return "", jwt.ErrInvalidKey
	}

	return userEmail, nil
}

func AuthMiddleware() gin.HandlerFunc {
	return func(context *gin.Context) {
		tokenString := context.GetHeader("Authorization")
		if tokenString == "" {
			context.JSON(http.StatusUnauthorized, gin.H{"message": "No token provided"})
			context.Abort()
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			context.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token"})
			context.Abort()
			return
		}

		context.Next()
	}
}
