package models

import (
	"time"
)

type Category string

const (
	Appliances    Category = "Appliances"
	Books         Category = "Books"
	Clothing      Category = "Clothing"
	Electronics   Category = "Electronics"
	Entertainment Category = "Entertainment"
	Furniture     Category = "Furniture"
	Miscellaneous Category = "Miscellaneous"
	Sports        Category = "Sports"
	Tickets       Category = "Tickets"
)

type Product struct {
	ID              int            `gorm:"primaryKey;autoIncrement"`
	Pid             string         `gorm:"type:uuid;unique;not null"`
	UserUID         string         `gorm:"type:uuid;index;not null"`
	Name            string         `gorm:"not null"`
	Description     string         `gorm:"type:text"`
	Price           float64        `gorm:"not null"`
	Category        Category       `gorm:"type:text;not null"`
	Quantity        int            `gorm:"not null;default:0"`
	PopularityScore float64        `gorm:"default:0"`
	CreatedAt       time.Time      `gorm:"autoCreateTime"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime"`
	PostedBy        User           `gorm:"foreignKey:UserUID;references:Uid;constraint:OnDelete:CASCADE;"`
	Images          []ProductImage `gorm:"foreignKey:Pid;references:Pid"`
}

type ProductImage struct {
	ID        int       `gorm:"primaryKey;autoIncrement"`
	Pid       string    `gorm:"type:varchar(36);not null;index"`
	IsMain    bool      `gorm:"not null;default:false"`
	Url       string    `gorm:"type:text;not null;"`
	MimeType  string    `gorm:"type:varchar(100);not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}
