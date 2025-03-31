import { CartProduct } from './cart-product.model'

export interface CartDetails {
  cartProducts: CartProduct[]
  productsTotal: string
  handlingFee: string
  totalCost: string
}
