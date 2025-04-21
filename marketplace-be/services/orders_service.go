package services

import (
	"marketplace-be/database"
	"marketplace-be/dtos"
	"marketplace-be/models"
)

type OrderProductCount struct {
	OrderID int
	Count   int
}

func GetOrderDetailsService(orderId, userUid string) (dtos.OrderDetailsResponse, error) {
	var order models.Order
	if err := database.DB.
		Preload("Products").
		Preload("Products.PostedBy").
		Where("user_uid = ? AND order_uid = ?", userUid, orderId).
		First(&order).Error; err != nil {
		return dtos.OrderDetailsResponse{}, ErrOrderNotFound
	}

	productDetails := make([]dtos.OrderProductDetails, 0)
	sellerMap := make(map[string]*dtos.OrderProductDetails)

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
	}

	for _, sellerInfo := range sellerMap {
		productDetails = append(productDetails, *sellerInfo)
	}

	return dtos.OrderDetailsResponse{
		OrderID:             order.OrderUID,
		OrderStatus:         order.OrderStatus,
		DatePlaced:          order.CreatedAt,
		PaymentMethod:       order.PaymentMethod,
		Location:            order.MeetupLocation,
		Date:                order.MeetupDate,
		Time:                order.MeetupTime,
		Notes:               order.AdditionalNotes,
		OrderProductDetails: productDetails,
		HandlingFee:         HandlingFee,
		TotalCost:           order.TotalCost,
	}, nil
}

func GetUserOrdersService(userUid string) (dtos.UserOrdersResponse, error) {
	var orders []models.Order
	if err := database.DB.
		Preload("Products").
		Where("user_uid = ? ", userUid).
		Order("created_at DESC").
		Limit(OrdersLimit).
		Find(&orders).Error; err != nil {
		return dtos.UserOrdersResponse{}, ErrUserOrdersNotFound
	}

	var totalOrders int64
	if err := database.DB.
		Model(&models.Order{}).
		Where("user_uid = ?", userUid).
		Count(&totalOrders).Error; err != nil {
		return dtos.UserOrdersResponse{}, ErrUserOrdersNotFound
	}

	orderIDs := make([]int, 0, len(orders))
	for _, order := range orders {
		orderIDs = append(orderIDs, order.ID)
	}

	var orderProductCounts []OrderProductCount
	if err := database.DB.
		Table("order_products").
		Select("order_id, COUNT(*) as count").
		Where("order_id IN ?", orderIDs).
		Group("order_id").
		Scan(&orderProductCounts).Error; err != nil {
		return dtos.UserOrdersResponse{}, err
	}

	totalItemsMap := make(map[int]int)
	for _, opc := range orderProductCounts {
		totalItemsMap[opc.OrderID] = opc.Count
	}

	var userOrderDetails []dtos.UserOrderDetails
	for _, order := range orders {
		userOrderDetails = append(userOrderDetails, dtos.UserOrderDetails{
			OrderID:       order.OrderUID,
			OrderStatus:   order.OrderStatus,
			DatePlaced:    order.CreatedAt,
			PaymentMethod: order.PaymentMethod,
			TotalItems:    totalItemsMap[order.ID],
			TotalCost:     order.TotalCost,
		})
	}

	return dtos.UserOrdersResponse{
		UserOrders:  userOrderDetails,
		TotalOrders: totalOrders,
	}, nil
}
