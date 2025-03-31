import { Component, Input, OnInit } from '@angular/core'
import { DatePipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { finalize } from 'rxjs'

import { AppCartService } from '../../../../core'
import { TextComponent } from '../../../../shared-ui'

@Component({
  selector: 'app-product-details',
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TextComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  @Input({ required: true }) productName!: string
  @Input({ required: true }) productDescription!: string
  @Input({ required: true }) postedAt!: Date
  @Input({ required: true }) postedBy!: string
  @Input({ required: true }) productId!: string
  @Input({ required: true }) maxQuantity!: number

  addToCartLoading = false

  quantity = 1
  quantityOptions: number[] = []

  constructor(private appCartService: AppCartService) {}

  ngOnInit(): void {
    console.log(this.maxQuantity)
    this.quantityOptions = Array.from(
      { length: Math.min(this.maxQuantity || 0, 10) },
      (_, i) => i + 1
    )
  }

  addtoCart = (): void => {
    console.log(this.quantity)
    this.addToCartLoading = true
    this.appCartService
      .addToCart(this.productId, Number(this.quantity))
      .pipe(finalize(() => (this.addToCartLoading = false)))
      .subscribe()
  }
}
