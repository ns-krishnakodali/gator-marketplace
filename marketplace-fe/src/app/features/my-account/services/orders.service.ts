import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'

import type { MyOrders, OrderDetails } from '../models'
import type { PaymentMethod } from '../../checkout/models'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import { capitalizeFirstLetter, ORDER_DETAILS_FETCH_ERROR } from '../../../utils'

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private areLoadingOrderDetailsSubject = new BehaviorSubject<boolean>(false)
  private ordersDetailsSubject = new BehaviorSubject<MyOrders>({} as MyOrders)

  public areLoadingOrderDetails$ = this.areLoadingOrderDetailsSubject.asObservable()
  public ordersDetails$ = this.ordersDetailsSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  getMyOrders = (): void => {
    this.areLoadingOrderDetailsSubject.next(true)
    this.apiService.get('api/user-orders').subscribe({
      next: (response: unknown) => {
        const ordersDetails: MyOrders = this.processOrdersDetails(response)
        this.ordersDetailsSubject.next(ordersDetails)
      },
      error: (error) => {
        this.notificationsService.addNotification({
          message: error.message,
          type: 'error',
        })
        this.areLoadingOrderDetailsSubject.next(false)
      },
      complete: () => {
        this.areLoadingOrderDetailsSubject.next(false)
      },
    })
  }

  openOrderDetails = (orderId: string): void => {
    this.router.navigate(['/order', orderId]).then((success) => {
      if (!success) {
        this.notificationsService.addNotification({
          message: ORDER_DETAILS_FETCH_ERROR,
          type: 'error',
        })
      }
    })
  }

  private processOrdersDetails = (response: unknown): MyOrders => {
    const data = response as { userOrders: never[]; totalOrders: number }
    if (!data) {
      return {} as MyOrders
    }
    return {
      userOrders: data.userOrders.map((order: OrderDetails) => ({
        ...order,
        paymentMethod: capitalizeFirstLetter(order.paymentMethod || '') as PaymentMethod,
      })),
      totalOrders: data.totalOrders,
    }
  }
}
