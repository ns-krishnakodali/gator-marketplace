import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'

import type { CartDetails, CartProduct, CartProductDTO, CartResponseDTO } from '../models'

import { APIService } from '../../../core'
import { NotificationsService } from '../../../shared-ui'
import { REMOVED_FROM_CART_SUCCESSFUL, TO_CHECKOUT_FAILED } from '../../../utils'

@Injectable({ providedIn: 'root' })
export class CartService {
  private getCartProductsIsLoadingSubject = new BehaviorSubject<boolean>(false)
  private removeCartProductIsLoadingSubject = new BehaviorSubject<boolean>(false)
  private cartDetailsSubject = new BehaviorSubject<{
    cartDetails: CartDetails
  }>({ cartDetails: {} as CartDetails })

  public getCartProductsIsLoading$ = this.getCartProductsIsLoadingSubject.asObservable()
  public removeCartProductIsLoading$ = this.removeCartProductIsLoadingSubject.asObservable()
  public cartDetails$ = this.cartDetailsSubject.asObservable()

  constructor(
    private apiService: APIService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  getCartProducts = (): void => {
    this.getCartProductsIsLoadingSubject.next(true)
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
        this.getCartProductsIsLoadingSubject.next(false)
      },
      complete: () => {
        this.getCartProductsIsLoadingSubject.next(false)
      },
    })
  }

  updateCartProducts = (productId: string, quantity: number): void => {
    if (quantity === 0) {
      this.removeFromCart(productId)
      return
    }
    this.apiService.put('api/cart', { productId, quantity }).subscribe({
      next: (response: unknown) => {
        const updatedCartDetails: CartDetails = this.processCartModifyResponse(response)
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
    this.removeCartProductIsLoadingSubject.next(true)
    this.apiService.delete(`api/cart/${productId}`).subscribe({
      next: (response: unknown) => {
        const updatedCartDetails: CartDetails = this.processCartModifyResponse(response)
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
        this.removeCartProductIsLoadingSubject.next(false)
      },
      complete: () => {
        this.removeCartProductIsLoadingSubject.next(false)
      },
    })
  }

  handleCartCheckout = (): void => {
    this.router.navigate(['/checkout', 'cart']).then((success) => {
      if (!success) {
        this.notificationsService.addNotification({
          message: TO_CHECKOUT_FAILED,
          type: 'error',
        })
      }
    })
  }

  navigateToProductPage = (productId: string): void => {
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

  private processCartModifyResponse = (response: unknown): CartDetails => {
    const productResponse = response as CartResponseDTO
    return {
      cartProducts: this.cartDetailsSubject.value.cartDetails.cartProducts,
      productsTotal: `${productResponse.productsTotal || '0'}`,
      handlingFee: `${productResponse.handlingFee || '0'}`,
      totalCost: `${productResponse.totalCost || '0'}`,
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
