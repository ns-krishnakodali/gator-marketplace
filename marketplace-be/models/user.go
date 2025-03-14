package models

import (
	"time"
)

type User struct {
	ID           int       `gorm:"primaryKey;autoIncrement"`
	Name         string    `gorm:"not null"`
	DisplayName  string    `gorm:"not null"`
	Mobile       string    `gorm:"not null"`
	Email        string    `gorm:"unique;not null"`
	PasswordHash string    `gorm:"not null"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`
}
