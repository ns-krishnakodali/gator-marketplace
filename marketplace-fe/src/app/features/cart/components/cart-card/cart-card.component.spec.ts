import { CommonModule, CurrencyPipe } from '@angular/common'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { By } from '@angular/platform-browser'

import { of } from 'rxjs'

import { CartCardComponent } from './cart-card.component'
import { CartService } from '../../services'
import { CartProduct } from '../../models'

describe('CartCardComponent', () => {
  let component: CartCardComponent
  let fixture: ComponentFixture<CartCardComponent>
  let cartServiceSpy: jasmine.SpyObj<CartService>

  const mockCartProduct: CartProduct = {
    productId: '123',
    name: 'Test Product',
    price: 19.99,
    quantity: 2,
    maxQuantity: 5,
    imageSrc: 'test-image.jpg',
  }

  beforeEach(async () => {
    const spy = jasmine.createSpyObj(
      'CartService',
      ['navigateToProductPage', 'removeFromCart', 'updateCartItems'],
      {
        removeCartItemIsLoading$: of(false),
      }
    )

    await TestBed.configureTestingModule({
      imports: [MatProgressSpinnerModule, CommonModule, CurrencyPipe, CartCardComponent],
      providers: [{ provide: CartService, useValue: spy }],
    }).compileComponents()

    cartServiceSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(CartCardComponent)
    component = fixture.componentInstance
    component.cartProduct = { ...mockCartProduct }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('UI elements', () => {
    it('should display product name correctly', () => {
      const nameElement = fixture.debugElement.query(By.css('#product-name')).nativeElement
      expect(nameElement.textContent.trim()).toBe('Test Product')
    })

    it('should display product price with currency format', () => {
      const priceElement = fixture.debugElement.query(By.css('#price')).nativeElement
      expect(priceElement.textContent).toContain('Price:')
      expect(priceElement.textContent).toContain('$19.99')
    })

    it('should display the correct quantity', () => {
      const quantityDisplay = fixture.debugElement.query(By.css('#quantity-display')).nativeElement
      expect(quantityDisplay.textContent.trim()).toBe('2')
    })

    it('should show quantity selector when not removing item', () => {
      cartServiceSpy.removeCartItemIsLoading$ = of(false)
      fixture.detectChanges()

      const spinner = fixture.debugElement.query(By.css('mat-spinner'))
      const quantitySelector = fixture.debugElement.query(By.css('.quantity-selector'))

      expect(spinner).toBeFalsy()
      expect(quantitySelector).toBeTruthy()
    })
  })

  describe('User interactions', () => {
    it('should call navigateToProductPage when image is clicked', () => {
      const image = fixture.debugElement.query(By.css('.cart-image')).nativeElement
      image.click()
      expect(cartServiceSpy.navigateToProductPage).toHaveBeenCalledWith('123')
    })

    it('should call navigateToProductPage when Enter key is pressed on image', () => {
      const image = fixture.debugElement.query(By.css('.cart-image')).nativeElement
      const event = new KeyboardEvent('keyup', { key: 'Enter' })
      image.dispatchEvent(event)
      expect(cartServiceSpy.navigateToProductPage).toHaveBeenCalledWith('123')
    })

    it('should increment quantity when + button is clicked', () => {
      const plusButton = fixture.debugElement.queryAll(By.css('.quantity-button'))[1].nativeElement
      plusButton.click()
      expect(component.cartProduct.quantity).toBe(3)
      expect(cartServiceSpy.updateCartItems).toHaveBeenCalledWith('123', 3)
    })

    it('should decrement quantity when - button is clicked', () => {
      const minusButton = fixture.debugElement.queryAll(By.css('.quantity-button'))[0].nativeElement
      minusButton.click()
      expect(component.cartProduct.quantity).toBe(1)
      expect(cartServiceSpy.updateCartItems).toHaveBeenCalledWith('123', 1)
    })

    it('should not allow quantity to go below 0', () => {
      component.cartProduct.quantity = 1
      fixture.detectChanges()

      const minusButton = fixture.debugElement.queryAll(By.css('.quantity-button'))[0].nativeElement
      minusButton.click()
      minusButton.click()

      expect(component.cartProduct.quantity).toBe(0)
      expect(cartServiceSpy.updateCartItems).toHaveBeenCalledWith('123', 0)
    })

    it('should not allow quantity to exceed maxQuantity', () => {
      component.cartProduct.quantity = 4
      fixture.detectChanges()

      const plusButton = fixture.debugElement.queryAll(By.css('.quantity-button'))[1].nativeElement
      plusButton.click()
      plusButton.click()

      expect(component.cartProduct.quantity).toBe(5)
      expect(cartServiceSpy.updateCartItems).toHaveBeenCalledWith('123', 5)
    })

    it('should not allow quantity to exceed 10 even if maxQuantity is higher', () => {
      component.cartProduct.maxQuantity = 15
      component.cartProduct.quantity = 9
      fixture.detectChanges()

      const plusButton = fixture.debugElement.queryAll(By.css('.quantity-button'))[1].nativeElement
      plusButton.click()
      plusButton.click()

      expect(component.cartProduct.quantity).toBe(10)
      expect(cartServiceSpy.updateCartItems).toHaveBeenCalledWith('123', 10)
    })
  })

  it('should handle maxQuantity of 0', () => {
    component.cartProduct = {
      ...mockCartProduct,
      maxQuantity: 0,
      quantity: 0,
    }
    fixture.detectChanges()

    const plusButton = fixture.debugElement.queryAll(By.css('.quantity-button'))[1].nativeElement
    plusButton.click()

    expect(component.cartProduct.quantity).toBe(0)
    expect(cartServiceSpy.updateCartItems).toHaveBeenCalledWith('123', 0)
  })
})
