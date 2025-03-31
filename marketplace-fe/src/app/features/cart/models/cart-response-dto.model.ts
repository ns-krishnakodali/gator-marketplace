export interface CartResponseDTO {
  cartProducts: CartProductDTO[]
  productsTotal: number
  handlingFee: number
  totalCost: number
}

export interface CartProductDTO {
  addedQuantity: number
  maxQuantity: number
  pid: string
  productName: string
  productPrice: number
  primaryImage: string
}
