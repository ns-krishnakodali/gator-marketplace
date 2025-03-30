import { ProductImage } from './product-image.model'

import { Categories } from '../../products/models'

export interface ProductDetails {
  pid: string
  name: string
  description: string
  price: number
  category: Categories
  postedBy: string
  quantity: number
  PopularityScore: number
  postedAt: Date
  updatedAt: Date
  productImages: ProductImage[]
}
