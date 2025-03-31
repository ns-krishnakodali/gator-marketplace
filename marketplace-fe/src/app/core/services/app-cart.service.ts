import { Injectable } from '@angular/core'

import { BehaviorSubject, Observable, tap } from 'rxjs'

import { APIService } from './api-service'

import { NotificationsService } from '../../shared-ui'
import { ADD_TO_CART_SUCCESSFUL } from '../../utils'

@Injectable({ providedIn: 'root' })
export class AppCartService {
  private isAddCartLoadingSubject = new BehaviorSubject<boolean>(false)

  public isAddCartLoading$ = this.isAddCartLoadingSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService
  ) {}

  addToCart = (productId: string, quantity = 1): Observable<unknown> => {
    console.log(typeof quantity)
    return this.apiService.post('api/cart', { productId, quantity }).pipe(
      tap({
        next: () => {
          this.notificationsService.addNotification({
            message: ADD_TO_CART_SUCCESSFUL,
            type: 'success',
          })
        },
        error: (error) => {
          this.notificationsService.addNotification({
            message: error.message,
            type: 'error',
          })
        },
      })
    )
  }
}
