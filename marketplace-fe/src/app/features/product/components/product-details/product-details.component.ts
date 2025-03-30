import { Component, Input, OnInit } from '@angular/core'
import { DatePipe } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import { ProductService } from '../../services'
import { TextComponent } from '../../../../shared-ui/text/text.component'

@Component({
  selector: 'app-product-details',
  imports: [DatePipe, MatButtonModule, MatIconModule, TextComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  @Input({ required: true }) productName!: string
  @Input({ required: true }) productDescription!: string
  @Input({ required: true }) postedAt!: Date
  @Input({ required: true }) postedBy!: string
  @Input({ required: true }) quantity = 0

  quantityOptions: number[] = []

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.quantityOptions = Array.from({ length: Math.min(this.quantity, 10) }, (_, i) => i + 1)
  }
}
