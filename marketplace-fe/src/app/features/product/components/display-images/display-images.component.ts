import { Component, Input, OnInit } from '@angular/core'

import type { ProductImage } from '../../models'

@Component({
  selector: 'app-display-images',
  imports: [],
  templateUrl: './display-images.component.html',
  styleUrl: './display-images.component.css',
})
export class DisplayImagesComponent implements OnInit {
  @Input({ required: true }) images: ProductImage[] = []
  displayImageSrc!: string

  ngOnInit(): void {
    this.displayImageSrc = this.images?.find((image) => image.isMain)?.src || this.images?.[0]?.src
  }

  onDisplayImageClick = (imageSrc: string): void => {
    this.displayImageSrc = imageSrc
  }
}
