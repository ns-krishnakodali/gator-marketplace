package models

import "time"

type CartProduct struct {
	ID         int       `gorm:"primaryKey;autoIncrement"`
	UserUID    string    `gorm:"type:uuid;index;not null"`
	ProductPID string    `gorm:"column:product_p_id;type:uuid;index;not null"`
	Quantity   int       `gorm:"not null;default:1"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`
	User       User      `gorm:"foreignKey:UserUID;references:Uid;constraint:OnDelete:CASCADE;"`
	Product    Product   `gorm:"foreignKey:ProductPID;references:Pid;constraint:OnDelete:CASCADE;"`
}
