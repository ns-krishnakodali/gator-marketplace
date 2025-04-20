package services

import (
	"marketplace-be/database"
	"marketplace-be/dtos"
	"marketplace-be/models"
)

func GetOrderDetailsService(orderId, userUid string) (dtos.OrderDetailsResponse, error) {
	var order models.Order
	if err := database.DB.
		Preload("Products").
		Preload("Products.PostedBy").
		Where("user_uid = ? AND order_id = ?", userUid, orderId).
		First(&order).Error; err != nil {
		return dtos.OrderDetailsResponse{}, ErrOrderNotFound
	}

	productDetails := make([]dtos.OrderProductDetails, 0)
	sellerMap := make(map[string]*dtos.OrderProductDetails)
	totalCost := 0.0

	// sellerMap -> userUid -> dtos.OrderProductDetails, to link products associated with seller
	for _, product := range order.Products {
		quantity, exists := order.ProductQuantityMap[product.Pid]
		if !exists || quantity == 0 {
			continue
		}

		sellerUID := product.PostedBy.Uid
		sellerInfo, ok := sellerMap[sellerUID]
		if !ok {
			sellerInfo = &dtos.OrderProductDetails{
				UserUid:     sellerUID,
				DisplayName: product.PostedBy.DisplayName,
				Contact:     product.PostedBy.Mobile,
			}
			sellerMap[sellerUID] = sellerInfo
		}

		productCost := float64(quantity) * product.Price
		sellerInfo.OrderProducts = append(sellerInfo.OrderProducts, dtos.OrderProduct{
			Pid:      product.Pid,
			Name:     product.Name,
			Quantity: quantity,
			Price:    productCost,
		})
		totalCost += productCost
	}

	for _, sellerInfo := range sellerMap {
		productDetails = append(productDetails, *sellerInfo)
	}

	return dtos.OrderDetailsResponse{
		OrderID:             order.OrderID,
		OrderStatus:         order.OrderStatus,
		DatePlaced:          order.CreatedAt,
		PaymentMethod:       order.PaymentMethod,
		Location:            order.MeetupLocation,
		Date:                order.MeetupDate,
		Time:                order.MeetupTime,
		Notes:               order.AdditionalNotes,
		OrderProductDetails: productDetails,
		HandlingFee:         HandlingFee,
		TotalCost:           totalCost,
	}, nil
}
