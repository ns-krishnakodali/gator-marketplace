export interface OrderProducts {
  pid: string
  name: string
  quantity: number
  price: number
}

export interface OrderItem {
  seller: string
  contact: string
  products: OrderProducts[]
}
