package dtos

type AccountDetailsResponse struct {
	DisplayImageUrl string `json:"displayImageUrl"`
	Name            string `json:"name"`
	DisplayName     string `json:"displayName"`
	Email           string `json:"email"`
	Mobile          string `json:"mobile"`
}

type AccountDetailsInput struct {
	Name        string `json:"name" binding:"required"`
	DisplayName string `json:"displayName" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Mobile      string `json:"mobile" binding:"required"`
}

type PasswordInput struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}
