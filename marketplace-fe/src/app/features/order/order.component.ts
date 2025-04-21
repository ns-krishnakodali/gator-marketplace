import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import { Observable } from 'rxjs'

import { OrderItemsComponent, OrderSummaryComponent } from './components'
import type { OrderDetails } from './models'

import { NavbarComponent, HeadingComponent } from '../../shared-ui'
import { OrderService } from './services'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

@Component({
  selector: 'app-order',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    NavbarComponent,
    HeadingComponent,
    OrderSummaryComponent,
    OrderItemsComponent,
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent implements OnInit {
  orderId!: string
  orderDetails!: OrderDetails
  isLoading$: Observable<boolean>

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {
    this.isLoading$ = this.orderService.isLoading$
  }

  ngOnInit(): void {
    this.orderService.orderDetails$.subscribe((data) => {
      this.orderDetails = data.orderDetails
    })

    this.orderId = this.route.snapshot.paramMap.get('orderId')!
    this.orderService.getOrderDetails(this.orderId)
  }
}
