import { OrderItem } from '../models'

export type OrderStatus = 'Placed' | 'Completed' | 'Cancelled'

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
