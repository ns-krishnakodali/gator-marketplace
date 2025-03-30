package models

import "time"

type CartItem struct {
	ID         int       `gorm:"primaryKey;autoIncrement"`
	UserUID    string    `gorm:"type:uuid;index;not null"`     // references User.Uid
	ProductPID string    `gorm:"column:product_p_id;type:uuid;index;not null"`
	Quantity   int       `gorm:"not null;default:1"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`

		// Below lines define the relationship:
	// GORM will use UserUID to find User.Uid
	// and ProductPID to find Product.Pid
	User    User    `gorm:"foreignKey:UserUID;references:Uid;constraint:OnDelete:CASCADE;"`
	Product Product `gorm:"foreignKey:ProductPID;references:Pid;constraint:OnDelete:CASCADE;"`

}
