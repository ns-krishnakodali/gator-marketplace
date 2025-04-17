import { Injectable } from '@angular/core'

import type { MeetupDetails, PaymentDetails } from '../models'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import { PROVIDE_MEETUP_DETAILS, SELECT_PAYMENT_METHOD } from '../../../utils'

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  constructor(
    private apiService: APIService,
    private notificationService: NotificationsService
  ) {}

  placeOrder = (meetupDetails: MeetupDetails, paymentDetails: PaymentDetails): void => {
    if (this.validateMeetupDetails(meetupDetails) && this.validatePaymentDetails(paymentDetails)) {
      console.log(meetupDetails, paymentDetails)
    }
  }

  validateMeetupDetails = (meetupDetails: MeetupDetails): boolean => {
    if (!meetupDetails || !(meetupDetails.address && meetupDetails.date && meetupDetails.time)) {
      this.notificationService.addNotification({
        message: PROVIDE_MEETUP_DETAILS,
        type: 'error',
      })
      return false
    }
    return true
  }

  validatePaymentDetails = (paymentDetails: PaymentDetails): boolean => {
    if (!paymentDetails || !paymentDetails.method) {
      this.notificationService.addNotification({
        message: SELECT_PAYMENT_METHOD,
        type: 'error',
      })
      return false
    }
    return true
  }
}
