export interface CheckoutDetailsResponseDTO {
  orderProductDetails: CheckoutOrderDetailsDTO[]
  productsTotal: number
  handlingFee: number
  totalCost: number
}

export interface CheckoutOrderDetailsDTO {
  productName: string
  quantity: number
  productTotalPrice: number
}
