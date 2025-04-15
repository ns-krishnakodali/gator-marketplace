import { Injectable } from '@angular/core'

import { BehaviorSubject, Observable, tap } from 'rxjs'

import { APIService } from './api-service'

import { NotificationsService } from '../../shared-ui'
import { ADD_TO_CART_SUCCESSFUL } from '../../utils'

@Injectable({ providedIn: 'root' })
export class AppCartService {
  private getCartProductsCountSubject = new BehaviorSubject<string>('')

  public getCartProductsCount$ = this.getCartProductsCountSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService
  ) {}

  getCartProductsCount = (): void => {
    this.apiService.get('api/cart/count').subscribe({
      next: (response: unknown) => {
        const { count } = response as { count: string }
        this.getCartProductsCountSubject.next(count)
      },
      error: (error) => {
        this.notificationsService.addNotification({
          message: error.message,
          type: 'error',
        })
      },
    })
  }

  addToCart = (productId: string, quantity = 1): Observable<unknown> => {
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
