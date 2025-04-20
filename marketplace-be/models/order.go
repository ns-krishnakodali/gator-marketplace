package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type PaymentMethod string

const (
	Cash  PaymentMethod = "Cash"
	Venmo PaymentMethod = "Venmo"
	Zelle PaymentMethod = "Zelle"
)

type OrderStatus string

const (
	OrderPlaced    OrderStatus = "Placed"
	OrderCompleted OrderStatus = "Completed"
	OrderCancelled OrderStatus = "Cancelled"
)

type ProductQuantityMap map[string]int

type Order struct {
	ID                 int                `gorm:"primaryKey;autoIncrement"`
	OrderID            string             `gorm:"type:uuid;unique;not null"`
	UserUID            string             `gorm:"type:uuid;index;not null"`
	MeetupLocation     string             `gorm:"type:text;"`
	MeetupDate         string             `gorm:"type:text;"`
	MeetupTime         string             `gorm:"type:text;"`
	AdditionalNotes    string             `gorm:"type:text;"`
	PaymentMethod      PaymentMethod      `gorm:"type:text;not null"`
	PriceProposal      int                `gorm:"default:null"`
	ProductQuantityMap ProductQuantityMap `gorm:"type:jsonb"`
	OrderStatus        OrderStatus        `gorm:"type:text;default:'Placed';not null"`
	CreatedAt          time.Time          `gorm:"autoCreateTime"`
	UpdatedAt          time.Time          `gorm:"autoUpdateTime"`
	BuyerRating        *int               `gorm:"default:null"`
	SellerRating       *int               `gorm:"default:null"`
	TotalCost          float64            `gorm:"default:null"`
	OrderedBy          User               `gorm:"foreignKey:UserUID;references:Uid;constraint:OnDelete:CASCADE;"`
	Products           []Product          `gorm:"many2many:order_products;joinForeignKey:OrderID;joinReferences:Pid"`
}

func (p *ProductQuantityMap) Value() (driver.Value, error) {
	if p == nil {
		return nil, nil
	}
	return json.Marshal(p)
}

func (p *ProductQuantityMap) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("value is not []byte")
	}
	return json.Unmarshal(bytes, p)
}
