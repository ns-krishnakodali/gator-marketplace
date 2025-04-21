import { CurrencyPipe, DatePipe } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatIconModule } from '@angular/material/icon'

import { Observable } from 'rxjs'

import type { MyOrders, OrderDetails } from '../../models'
import { OrdersService } from '../../services'

import { OrderStatusComponent, TextComponent } from '../../../../shared-ui'
import { getUUIDPrefix } from '../../../../utils'

@Component({
  selector: 'app-orders',
  imports: [
    MatButtonToggleModule,
    MatIconModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    TextComponent,
    OrderStatusComponent,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  myOrders!: MyOrders
  displayOrderDetails!: OrderDetails[]
  areLoadingOrderDetails$: Observable<boolean>
  selectedStatus = 'all'

  constructor(private ordersSerice: OrdersService) {
    this.areLoadingOrderDetails$ = this.ordersSerice.areLoadingOrderDetails$
  }

  ngOnInit(): void {
    this.ordersSerice.ordersDetails$.subscribe((data: MyOrders) => {
      this.myOrders = data
      this.displayOrderDetails = this.myOrders.userOrders
    })
    this.ordersSerice.getMyOrders()
  }

  openOrderDetails = (orderId: string): void => {
    this.ordersSerice.openOrderDetails(orderId)
  }

  orderIdPrefix = (orderId: string): string => getUUIDPrefix(orderId)

  orderItemsText = (items: number): string => `${items} item${items === 1 ? '' : 's'}`

  onStatusChange = (event: MatButtonToggleChange): void => {
    const selected: string = event?.value
    if (selected === 'all') {
      this.displayOrderDetails = this.myOrders.userOrders
      return
    }
    this.displayOrderDetails = this.myOrders.userOrders.filter(
      (orderDetails: OrderDetails) => orderDetails?.orderStatus?.toLowerCase() === selected
    )
  }
}
