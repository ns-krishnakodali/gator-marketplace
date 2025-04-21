import type { OrderStatus } from '../../../shared-ui'
import type { PaymentMethod } from '../../checkout/models'

export interface MyOrders {
  userOrders: OrderDetails[]
  totalOrders: number
}

export interface OrderDetails {
  orderId: string
  orderStatus: OrderStatus
  datePlaced: string
  paymentMethod: PaymentMethod
  totalItems: number
  totalCost: number
}
