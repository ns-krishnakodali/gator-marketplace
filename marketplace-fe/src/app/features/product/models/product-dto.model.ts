import { Categories } from '../../products/models'

export interface ProductImageDTO {
  url: string
  mimeType: string
  isMain: boolean
}

export interface ProductResponseDTO {
  pid: string
  name: string
  description: string
  price: number
  category: Categories
  postedBy: string
  quantity: number
  popularityScore: number
  postedAt: Date
  images: ProductImageDTO[]
}
