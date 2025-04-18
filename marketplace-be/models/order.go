package models

import "time"

type PaymentMethod string

const (
	Cash  PaymentMethod = "Appliances"
	Venmo PaymentMethod = "Venmo"
	Zelle PaymentMethod = "Zelle"
)

type OrderStatus string

const (
	OrderPlaced    OrderStatus = "Placed"
	OrderCompleted OrderStatus = "Completed"
	OrderCancelled OrderStatus = "Cancelled"
)

type Order struct {
	ID              int           `gorm:"primaryKey;autoIncrement"`
	UserUID         string        `gorm:"type:uuid;index;not null"`
	ProductPID      string        `gorm:"type:uuid;unique;not null"`
	MeetupLocation  string        `gorm:"type:text;"`
	MeetupDate      string        `gorm:"type:text;"`
	AdditionalNotes string        `gorm:"type:text;"`
	PaymentMethod   PaymentMethod `gorm:"type:text;not null"`
	OrderStatus     OrderStatus   `gorm:"type:text;default:'Placed';not null"`
	CreatedAt       time.Time     `gorm:"autoCreateTime"`
	UpdatedAt       time.Time     `gorm:"autoUpdateTime"`
	BuyerRating     *int          `gorm:"default:null"`
	SellerRating    *int          `gorm:"default:null"`
	User            User          `gorm:"foreignKey:UserUID;references:Uid;constraint:OnDelete:CASCADE;"`
	Product         Product       `gorm:"foreignKey:ProductPID;references:Pid;constraint:OnDelete:CASCADE;"`
}
