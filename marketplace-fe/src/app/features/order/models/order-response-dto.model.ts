import type { OrderStatus } from '../../../shared-ui'

export interface OrderDetailsResponseDTO {
  orderId: string
  orderStatus: OrderStatus
  datePlaced: string
  paymentMethod: string
  location: string
  date: string
  time: string
  notes: string
  orderProductDetails: OrderProductDetailsDTO[]
  handlingFee: number
  totalCost: number
}

export interface OrderProductDetailsDTO {
  userUid: string
  displayName: string
  contact: string
  orderProducts: [
    {
      pid: string
      name: string
      quantity: number
      price: number
    },
  ]
}
