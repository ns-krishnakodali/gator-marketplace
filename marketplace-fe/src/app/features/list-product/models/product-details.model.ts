import { Categories } from '../../products/models'

export interface ProductDetails {
  name: string
  description: string
  price: number
  category: Categories | ''
  quantity: number
}
