import { Component, ViewChild } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { GoogleMap } from '@angular/google-maps'

import { MatButtonModule } from '@angular/material/button'
import { MatStepper, MatStepperModule } from '@angular/material/stepper'

import type { MeetupDetails, PaymentDetails } from '../../models'
import { CheckoutService } from '../../services'
import { ButtonComponent, HeadingComponent } from '../../../../shared-ui'
import { GAINESVILLE_COORDINATES } from '../../../../utils'

@Component({
  selector: 'app-checkout-details',
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    GoogleMap,
    ButtonComponent,
    HeadingComponent,
  ],
  templateUrl: './checkout-details.component.html',
  styleUrl: './checkout-details.component.css',
})
export class CheckoutDetailsComponent {
  readonly isLinearStepper = true
  displayMap = false

  meetupDetails: MeetupDetails = {
    address: '',
    date: '',
    time: '',
    additionalNotes: '',
  }

  paymentDetails: PaymentDetails = {
    method: 'cash',
  }

  zoom = 13
  center: google.maps.LatLngLiteral = GAINESVILLE_COORDINATES
  display!: google.maps.LatLngLiteral

  @ViewChild('stepper') stepper!: MatStepper

  constructor(private checkoutService: CheckoutService) {}

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

  completeOrder = (): void => {
    this.checkoutService.placeProductsOrder(this.meetupDetails, this.paymentDetails)
  }
}
