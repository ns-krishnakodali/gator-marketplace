import { Component } from '@angular/core'

import { ListProductService } from '../../services'

@Component({
  selector: 'app-product-images',
  templateUrl: './product-images.component.html',
  styleUrls: ['./product-images.component.css'],
})
export class ProductImagesComponent {
  readonly MAX_IMAGES = 6
  imageFiles: File[] = []
  imagePreviews: string[] = []

  constructor(private listProductService: ListProductService) {}

  onImagesSelected = (event: Event): void => {
    const input = event.target as HTMLInputElement
    if (input.files) {
      this.addImages(Array.from(input.files))
    }
  }

  onDragOver = (event: DragEvent): void => {
    event.preventDefault()
  }

  onDrop = (event: DragEvent): void => {
    event.preventDefault()
    if (event.dataTransfer?.files) {
      this.addImages(Array.from(event.dataTransfer.files))
    }
  }

  removeImage = (index: number): void => {
    this.imagePreviews.splice(index, 1)
  }

  private addImages = (files: File[]): void => {
    this.listProductService.processImages(
      files,
      this.MAX_IMAGES,
      this.imagePreviews.length,
      (imageDataUrl: string) => {
        this.imagePreviews.push(imageDataUrl)
      },
      (imageFile: File) => {
        this.imageFiles.push(imageFile)
      }
    )
  }
}
