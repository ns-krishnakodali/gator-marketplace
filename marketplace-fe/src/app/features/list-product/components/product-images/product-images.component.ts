import { Component } from '@angular/core'

@Component({
  selector: 'app-product-images',
  templateUrl: './product-images.component.html',
  styleUrls: ['./product-images.component.css'],
})
export class ProductImagesComponent {
  imagePreviews: string[] = []
  readonly MAX_IMAGES = 6

  onImagesSelected = (event: Event): void => {
    const input = event.target as HTMLInputElement
    if (input.files) {
      this.processFiles(Array.from(input.files))
    }
  }

  onDragOver = (event: DragEvent): void => {
    event.preventDefault()
  }

  onDrop = (event: DragEvent): void => {
    event.preventDefault()
    if (event.dataTransfer?.files) {
      this.processFiles(Array.from(event.dataTransfer.files))
    }
  }

  removeImage = (index: number): void => {
    console.log(index)
    this.imagePreviews.splice(index, 1)
  }

  // Move to services
  private processFiles = (files: File[]): void => {
    const remainingSlots = 6 - this.imagePreviews.length
    const filesToProcess = files.slice(0, remainingSlots)

    for (const file of filesToProcess) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          this.imagePreviews.push(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }
}
