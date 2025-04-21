import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'

import type {
  OrderDetails,
  OrderDetailsResponseDTO,
  OrderItem,
  OrderProductDetailsDTO,
} from '../models'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import { capitalizeFirstLetter, PRODUCT_DETAILS_FETCH_ERROR } from '../../../utils'

@Injectable({ providedIn: 'root' })
export class OrderService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false)
  private orderDetailsSubject = new BehaviorSubject<{
    orderDetails: OrderDetails
  }>({ orderDetails: {} as OrderDetails })

  public isLoading$ = this.isLoadingSubject.asObservable()
  public orderDetails$ = this.orderDetailsSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  getOrderDetails = (orderId: string) => {
    this.isLoadingSubject.next(true)
    this.apiService.get(`api/order/${orderId}`).subscribe({
      next: (response: unknown) => {
        const orderDetails: OrderDetails = this.processOrderDetailsResponse(response)
        this.orderDetailsSubject.next({
          orderDetails,
        })
      },
      error: (error) => {
        this.notificationsService.addNotification({
          message: error.message,
          type: 'error',
        })
        this.isLoadingSubject.next(false)
      },
      complete: () => {
        this.isLoadingSubject.next(false)
      },
    })
  }

  openProductDetails = (productId: string): void => {
    this.router.navigate(['/product', productId]).then((success) => {
      if (!success) {
        this.notificationsService.addNotification({
          message: PRODUCT_DETAILS_FETCH_ERROR,
          type: 'error',
        })
      }
    })
  }

  private processOrderDetailsResponse = (response: unknown): OrderDetails => {
    const orderDetailsResponse = response as OrderDetailsResponseDTO
    return {
      orderSummary: {
        orderId: orderDetailsResponse.orderId,
        orderStatus: orderDetailsResponse.orderStatus,
        datePlaced: orderDetailsResponse.datePlaced,
        paymentMethod: capitalizeFirstLetter(orderDetailsResponse.paymentMethod),
        location: orderDetailsResponse.location,
        date: orderDetailsResponse.date,
        time: orderDetailsResponse.time,
        notes: orderDetailsResponse.notes,
      },
      orderItems: this.getOrderItems(orderDetailsResponse.orderProductDetails),
      handlingFee: orderDetailsResponse.handlingFee,
      total: orderDetailsResponse.totalCost,
    }
  }

  private getOrderItems = (orderProductDetailsDTO: OrderProductDetailsDTO[]): OrderItem[] => {
    return (
      orderProductDetailsDTO?.map((orderDetails: OrderProductDetailsDTO) => ({
        seller: orderDetails.displayName,
        contact: orderDetails.contact,
        products: orderDetails.orderProducts,
      })) || []
    )
  }
}
