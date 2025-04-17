import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

import type {
  CheckoutDetailsResponseDTO,
  CheckoutOrderDetails,
  CheckoutOrderDetailsDTO,
  CheckoutProductDetail,
  MeetupDetails,
  PaymentDetails,
} from '../models'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import {
  INVALID_DATE,
  isValidDate,
  PROVIDE_MEETUP_DETAILS,
  SELECT_PAYMENT_METHOD,
} from '../../../utils'

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private getCheckoutDetailsIsLoadingSubject = new BehaviorSubject<boolean>(false)
  private checkoutOrderDetailsSubject = new BehaviorSubject<{
    checkoutOrderDetails: CheckoutOrderDetails
  }>({ checkoutOrderDetails: {} as CheckoutOrderDetails })

  public getCheckoutDetailsIsLoading$ = this.getCheckoutDetailsIsLoadingSubject.asObservable()
  public checkoutOrderDetails$ = this.checkoutOrderDetailsSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService
  ) {}

  placeProductsOrder = (meetupDetails: MeetupDetails, paymentDetails: PaymentDetails): void => {
    if (this.validateMeetupDetails(meetupDetails) && this.validatePaymentDetails(paymentDetails)) {
      console.log(meetupDetails, paymentDetails)
    }
  }

  getCheckoutDetails = (): void => {
    this.getCheckoutDetailsIsLoadingSubject.next(true)
    this.apiService.get('api/checkout-details').subscribe({
      next: (response: unknown) => {
        const checkoutOrderDetails: CheckoutOrderDetails =
          this.processCheckoutDetailsResponse(response)
        this.checkoutOrderDetailsSubject.next({ checkoutOrderDetails })
      },
      error: (error) => {
        this.notificationsService.addNotification({
          message: error.message,
          type: 'error',
        })
        this.getCheckoutDetailsIsLoadingSubject.next(false)
      },
      complete: () => {
        this.getCheckoutDetailsIsLoadingSubject.next(false)
      },
    })
  }

  validateMeetupDetails = (meetupDetails: MeetupDetails): boolean => {
    if (!meetupDetails || !(meetupDetails.address && meetupDetails.date && meetupDetails.time)) {
      this.notificationsService.addNotification({
        message: PROVIDE_MEETUP_DETAILS,
        type: 'error',
      })
      return false
    }
    if (!isValidDate(meetupDetails.date)) {
      this.notificationsService.addNotification({
        message: INVALID_DATE,
        type: 'error',
      })
      return false
    }

    return true
  }

  validatePaymentDetails = (paymentDetails: PaymentDetails): boolean => {
    if (!paymentDetails || !paymentDetails.method) {
      this.notificationsService.addNotification({
        message: SELECT_PAYMENT_METHOD,
        type: 'error',
      })
      return false
    }
    return true
  }

  private processCheckoutDetailsResponse = (response: unknown): CheckoutOrderDetails => {
    const checkoutDetailsResponse = response as CheckoutDetailsResponseDTO
    return {
      checkoutProductDetails: this.processCheckoutProducts(
        checkoutDetailsResponse.orderProductDetails
      ),
      subTotal: checkoutDetailsResponse.productsTotal,
      handlingFee: checkoutDetailsResponse.handlingFee,
      totalPrice: checkoutDetailsResponse.totalCost,
    }
  }

  private processCheckoutProducts = (
    checkoutProducts: CheckoutOrderDetailsDTO[]
  ): CheckoutProductDetail[] =>
    checkoutProducts.map(({ productName, quantity, productTotalPrice }) => ({
      name: productName,
      quantity,
      productTotalPrice,
    })) || []
}
