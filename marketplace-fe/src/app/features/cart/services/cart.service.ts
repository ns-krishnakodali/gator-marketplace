import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'

import type { CartDetails, CartProduct, CartProductDTO, CartResponseDTO } from '../models'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import { REMOVED_FROM_CART_SUCCESSFUL } from '../../../utils'

@Injectable({ providedIn: 'root' })
export class CartService {
  private getCartItemsIsLoadingSubject = new BehaviorSubject<boolean>(false)
  private removeCartItemIsLoadingSubject = new BehaviorSubject<boolean>(false)
  private cartDetailsSubject = new BehaviorSubject<{
    cartDetails: CartDetails
  }>({ cartDetails: {} as CartDetails })

  public getCartItemsIsLoading$ = this.getCartItemsIsLoadingSubject.asObservable()
  public removeCartItemIsLoading$ = this.removeCartItemIsLoadingSubject.asObservable()
  public cartDetails$ = this.cartDetailsSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  getCartItems = (): void => {
    this.getCartItemsIsLoadingSubject.next(true)
    this.apiService.get('api/cart').subscribe({
      next: (response: unknown) => {
        const cartDetails: CartDetails = this.processCartDetailsResponse(response)
        this.cartDetailsSubject.next({ cartDetails })
      },
      error: (error) => {
        this.notificationsService.addNotification({
          message: error.message,
          type: 'error',
        })
        this.getCartItemsIsLoadingSubject.next(false)
      },
      complete: () => {
        this.getCartItemsIsLoadingSubject.next(false)
      },
    })
  }

  updateCartItems = (productId: string, quantity: number): void => {
    if (quantity === 0) {
      this.removeFromCart(productId)
      return
    }
    this.apiService.put('api/cart', { productId, quantity }).subscribe({
      next: (response: unknown) => {
        const updatedCartDetails: CartDetails = this.processUpdateCardDetailsResponse(response)
        this.cartDetailsSubject.next({ cartDetails: updatedCartDetails })
      },
      error: (error) => {
        this.notificationsService.addNotification({
          message: error.message,
          type: 'error',
        })
      },
    })
  }

  removeFromCart = (productId: string): void => {
    this.removeCartItemIsLoadingSubject.next(true)
    this.apiService.delete(`api/cart/${productId}`).subscribe({
      next: () => {
        const updatedCartDetails: CartDetails = { ...this.cartDetailsSubject.value.cartDetails }
        updatedCartDetails.cartProducts = updatedCartDetails.cartProducts.filter(
          (product: CartProduct) => product.productId !== productId
        )
        this.cartDetailsSubject.next({ cartDetails: updatedCartDetails })

        this.notificationsService.addNotification({
          message: REMOVED_FROM_CART_SUCCESSFUL,
          type: 'success',
        })
      },
      error: (error) => {
        this.notificationsService.addNotification({
          message: error.message,
          type: 'error',
        })
        this.removeCartItemIsLoadingSubject.next(false)
      },
      complete: () => {
        this.removeCartItemIsLoadingSubject.next(false)
      },
    })
  }

  public navigateToProductPage = (productId: string): void => {
    this.router.navigate(['product', productId])
  }

  private processCartDetailsResponse = (response: unknown): CartDetails => {
    const productResponse = response as CartResponseDTO
    return {
      cartProducts: this.processCartProducts(productResponse.cartProducts),
      productsTotal: `${productResponse.productsTotal || ''}`,
      handlingFee: `${productResponse.handlingFee || 'N/A'}`,
      totalCost: `${productResponse.totalCost || 'N/A'}`,
    }
  }

  private processUpdateCardDetailsResponse = (response: unknown): CartDetails => {
    const productResponse = response as CartResponseDTO
    return {
      cartProducts: this.cartDetailsSubject.value.cartDetails.cartProducts,
      productsTotal: `${productResponse.productsTotal || ''}`,
      handlingFee: `${productResponse.handlingFee || 'N/A'}`,
      totalCost: `${productResponse.totalCost || 'N/A'}`,
    }
  }

  private processCartProducts = (cartProducts: CartProductDTO[]): CartProduct[] =>
    cartProducts.map(
      ({ pid, productName, productPrice, addedQuantity, maxQuantity, primaryImage }) => ({
        productId: pid,
        name: productName,
        price: productPrice,
        quantity: addedQuantity,
        maxQuantity: maxQuantity,
        imageSrc: primaryImage,
      })
    ) || []
}
