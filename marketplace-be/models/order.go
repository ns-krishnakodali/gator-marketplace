package models

import "time"

type PaymentMethod string

const (
	Cash  PaymentMethod = "cash"
	Venmo PaymentMethod = "venmo"
	Zelle PaymentMethod = "zelle"
)

type OrderStatus string

const (
	OrderPlaced    OrderStatus = "Placed"
	OrderCompleted OrderStatus = "Completed"
	OrderCancelled OrderStatus = "Cancelled"
)

type Order struct {
	ID              int           `gorm:"primaryKey;autoIncrement"`
	OrderID         string        `gorm:"type:uuid;unique;not null"`
	UserUID         string        `gorm:"type:uuid;index;not null"`
	MeetupLocation  string        `gorm:"type:text;"`
	MeetupDate      string        `gorm:"type:text;"`
	MeetupTime      string        `gorm:"type:text;"`
	AdditionalNotes string        `gorm:"type:text;"`
	PaymentMethod   PaymentMethod `gorm:"type:text;not null"`
	OrderStatus     OrderStatus   `gorm:"type:text;default:'Placed';not null"`
	CreatedAt       time.Time     `gorm:"autoCreateTime"`
	UpdatedAt       time.Time     `gorm:"autoUpdateTime"`
	BuyerRating     *int          `gorm:"default:null"`
	SellerRating    *int          `gorm:"default:null"`
	OrderedBy       User          `gorm:"foreignKey:UserUID;references:Uid;constraint:OnDelete:CASCADE;"`
	Products        []Product     `gorm:"many2many:order_products;"`
}
