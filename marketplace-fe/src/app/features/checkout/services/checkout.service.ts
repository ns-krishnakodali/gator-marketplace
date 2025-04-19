import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

import type {
  CheckoutDetailsResponseDTO,
  CheckoutOrderDetails,
  CheckoutOrderDetailsDTO,
  CheckoutProductDetail,
  MeetupDetails,
  PaymentMethod,
} from '../models'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import {
  INVALID_DATE,
  INVALID_PRICE_PROPOSAL,
  INVALID_PRODUCT_QUANTITY,
  isValidDate,
  PROVIDE_MEETUP_DETAILS,
  SELECT_PAYMENT_METHOD,
} from '../../../utils'

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private getCheckoutDetailsIsLoadingSubject = new BehaviorSubject<boolean>(false)
  private getCheckoutOrderIsLoadingSubject = new BehaviorSubject<boolean>(false)
  private checkoutOrderDetailsSubject = new BehaviorSubject<{
    checkoutOrderDetails: CheckoutOrderDetails
  }>({ checkoutOrderDetails: {} as CheckoutOrderDetails })

  public getCheckoutDetailsIsLoading$ = this.getCheckoutDetailsIsLoadingSubject.asObservable()
  public getCheckoutOrderIsLoading$ = this.getCheckoutOrderIsLoadingSubject.asObservable()
  public checkoutOrderDetails$ = this.checkoutOrderDetailsSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService
  ) {}

  getCheckoutCartDetails = (): void => {
    this.getCheckoutDetails('api/checkout/cart')
  }

  getCheckoutProductDetails = (pid: string, qty: string): void => {
    this.getCheckoutDetails('api/checkout/product', { pid, qty })
  }

  placeCartOrder = (meetupDetails: MeetupDetails, paymentMethod: PaymentMethod): void => {
    if (this.validateMeetupDetails(meetupDetails) && this.validatePaymentMethod(paymentMethod)) {
      this.placeOrder('api/checkout/cart', {
        meetupAddress: meetupDetails.address,
        meetupDate: meetupDetails.date,
        meetupTime: meetupDetails.time,
        additionalNotes: meetupDetails.additionalNotes,
        paymentMethod: paymentMethod,
      })
    }
  }

  placeProductOrder = (
    meetupDetails: MeetupDetails,
    paymentMethod: PaymentMethod,
    pid: string,
    quantity: string
  ): void => {
    if (this.validateMeetupDetails(meetupDetails) && this.validatePaymentMethod(paymentMethod)) {
      let iQuantity: number
      try {
        iQuantity = parseInt(quantity, 10)
      } catch {
        this.notificationsService.addNotification({
          message: INVALID_PRODUCT_QUANTITY,
          type: 'error',
        })
        return
      }
      this.placeOrder('api/checkout/product', {
        meetupAddress: meetupDetails.address,
        meetupDate: meetupDetails.date,
        meetupTime: meetupDetails.time,
        additionalNotes: meetupDetails.additionalNotes,
        paymentMethod: paymentMethod,
        productId: pid,
        quantity: iQuantity,
        priceProposal: meetupDetails.priceProposal,
      })
    }
  }

  validateMeetupDetails = (meetupDetails: MeetupDetails): boolean => {
    if (!meetupDetails || !(meetupDetails.address && meetupDetails.date && meetupDetails.time)) {
      this.notificationsService.addNotification({
        message: PROVIDE_MEETUP_DETAILS,
        type: 'error',
      })
      return false
    }
    if (meetupDetails.priceProposal && meetupDetails.priceProposal <= 0) {
      this.notificationsService.addNotification({
        message: INVALID_PRICE_PROPOSAL,
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

  private validatePaymentMethod = (paymentMethod: PaymentMethod): boolean => {
    if (!paymentMethod) {
      this.notificationsService.addNotification({
        message: SELECT_PAYMENT_METHOD,
        type: 'error',
      })
      return false
    }
    return true
  }

  private getCheckoutDetails = (url: string, params?: Record<string, string>): void => {
    this.getCheckoutDetailsIsLoadingSubject.next(true)
    this.apiService.get(url, params).subscribe({
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

  private placeOrder = (url: string, body: unknown): void => {
    this.getCheckoutOrderIsLoadingSubject.next(true)
    this.apiService.post(url, body).subscribe({
      next: (response: unknown) => {
        const { orderId } = response as { orderId: string }
        console.log(orderId)
      },
      error: (error) => {
        this.notificationsService.addNotification({
          message: error.message,
          type: 'error',
        })
        this.getCheckoutOrderIsLoadingSubject.next(false)
      },
      complete: () => {
        this.getCheckoutOrderIsLoadingSubject.next(false)
      },
    })
  }

  private processCheckoutDetailsResponse = (response: unknown): CheckoutOrderDetails => {
    const checkoutDetailsResponse = response as CheckoutDetailsResponseDTO
    return {
      checkoutProductDetails: this.processCheckoutProducts(
        checkoutDetailsResponse?.orderProductDetails
      ),
      subTotal: checkoutDetailsResponse?.productsTotal,
      handlingFee: checkoutDetailsResponse?.handlingFee,
      totalPrice: checkoutDetailsResponse?.totalCost,
    }
  }

  private processCheckoutProducts = (
    checkoutProducts: CheckoutOrderDetailsDTO[]
  ): CheckoutProductDetail[] =>
    checkoutProducts?.map(({ productName, quantity, productTotalPrice }) => ({
      name: productName,
      quantity,
      productTotalPrice,
    })) || []
}
