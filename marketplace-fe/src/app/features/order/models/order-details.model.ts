import type { OrderItem } from '../models'
import type { OrderStatus } from '../../../shared-ui'

export interface OrderDetails {
  orderSummary: OrderSummary
  orderItems: OrderItem[]
  handlingFee: number
  total: number
}

export interface OrderSummary {
  orderId: string
  orderStatus: OrderStatus
  datePlaced: string
  paymentMethod: string
  location: string
  date: string
  time: string
  notes: string
}
