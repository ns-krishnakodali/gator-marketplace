import { Component, Input, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { GoogleMap } from '@angular/google-maps'

import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatStepper, MatStepperModule } from '@angular/material/stepper'

import { Observable } from 'rxjs'

import type { CheckoutFrom, MeetupDetails, PaymentMethod } from '../../models'
import { CheckoutService } from '../../services'
import { ButtonComponent, HeadingComponent } from '../../../../shared-ui'
import { UFL_COORDINATES } from '../../../../utils'

@Component({
  selector: 'app-checkout-details',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    CommonModule,
    FormsModule,
    GoogleMap,
    ButtonComponent,
    HeadingComponent,
  ],
  templateUrl: './checkout-details.component.html',
  styleUrl: './checkout-details.component.css',
})
export class CheckoutDetailsComponent {
  @ViewChild('stepper') stepper!: MatStepper
  @Input({ required: true }) checkoutFrom!: CheckoutFrom
  @Input({ required: true }) pid!: string
  @Input({ required: true }) quantity!: string

  isCheckoutLoading$: Observable<boolean>

  readonly isLinearStepper = true
  displayMap = false
  zoom = 13
  center: google.maps.LatLngLiteral = UFL_COORDINATES
  display!: google.maps.LatLngLiteral

  meetupDetails: MeetupDetails = {
    address: '',
    date: '',
    time: '',
    additionalNotes: '',
  }

  paymentMethod: PaymentMethod = 'cash'

  constructor(private checkoutService: CheckoutService) {
    this.isCheckoutLoading$ = this.checkoutService.getCheckoutOrderIsLoading$
  }

  moveMap = (event: google.maps.MapMouseEvent): void => {
    if (event.latLng) {
      this.center = event.latLng.toJSON()

      new google.maps.Geocoder().geocode({ location: event.latLng }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const address = results[0].formatted_address
          this.meetupDetails.address = address
        } else {
          console.warn('Geocoder failed due to:', status)
        }
      })
    }
  }

  move = (event: google.maps.MapMouseEvent): void => {
    if (event.latLng) {
      this.display = event.latLng.toJSON()
    }
  }

  toggleDisplayMap = (): void => {
    this.displayMap = !this.displayMap
  }

  goToPaymentStep = (): void => {
    if (this.checkoutService.validateMeetupDetails(this.meetupDetails)) {
      this.stepper.next()
    }
  }

  completeOrderCheckout = (): void => {
    if (this.checkoutFrom === 'cart')
      this.checkoutService.placeCartOrder(this.meetupDetails, this.paymentMethod)
    else if (this.checkoutFrom === 'product')
      this.checkoutService.placeProductOrder(
        this.meetupDetails,
        this.paymentMethod,
        this.pid,
        this.quantity
      )
  }
}
