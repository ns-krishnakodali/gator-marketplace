export interface CheckoutOrderDetails {
  checkoutProductDetails: CheckoutProductDetail[]
  subTotal: number
  handlingFee: number
  totalPrice: number
}

export interface CheckoutProductDetail {
  name: string
  quantity: number
  productTotalPrice: number
}
