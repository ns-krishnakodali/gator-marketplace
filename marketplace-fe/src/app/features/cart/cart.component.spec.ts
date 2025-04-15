import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterModule } from '@angular/router'

import { of } from 'rxjs'

import { CartComponent } from './cart.component'

import { CartService } from './services'

describe('CartComponent', () => {
  let component: CartComponent
  let fixture: ComponentFixture<CartComponent>
  let cartServiceSpy: jasmine.SpyObj<CartService>

  const mockCartDetails = {
    cartProducts: [
      {
        id: '123',
        productId: '456',
        name: 'Test Product',
        price: 29.99,
        quantity: 2,
        imageUrl: 'https://example.com/test-image.jpg',
      },
    ],
    productsTotal: 59.98,
    handlingFee: 5.99,
    totalCost: 65.97,
  }

  beforeEach(async () => {
    cartServiceSpy = jasmine.createSpyObj('CartService', ['getCartItems'], {
      getCartItemsIsLoading$: of(false),
      cartDetails$: of({ cartDetails: mockCartDetails }),
    })

    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: CartService, useValue: cartServiceSpy }],
    }).compileComponents()

    fixture = TestBed.createComponent(CartComponent)
    component = fixture.componentInstance
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should call getCartItems on init', () => {
    fixture.detectChanges()
    expect(cartServiceSpy.getCartProducts).toHaveBeenCalled()
  })
})
