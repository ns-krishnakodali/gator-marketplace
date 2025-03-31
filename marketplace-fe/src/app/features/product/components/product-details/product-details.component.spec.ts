import { DatePipe } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { of, finalize } from 'rxjs'

import { ProductDetailsComponent } from './product-details.component'

import { AppCartService } from '../../../../core'

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent
  let fixture: ComponentFixture<ProductDetailsComponent>
  let appCartServiceSpy: jasmine.SpyObj<AppCartService>

  beforeEach(async () => {
    appCartServiceSpy = jasmine.createSpyObj('AppCartService', ['addToCart'])
    appCartServiceSpy.addToCart.and.returnValue(of({})) // Mock successful response

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: AppCartService, useValue: appCartServiceSpy }],
    }).compileComponents()

    fixture = TestBed.createComponent(ProductDetailsComponent)
    component = fixture.componentInstance

    // Set required input properties
    component.productName = 'Test Product'
    component.productDescription = 'This is a test description'
    component.postedAt = new Date('2025-03-30')
    component.postedBy = 'Test User'
    component.productId = 'test-product-id'
    component.maxQuantity = 20
  })

  it('should create', () => {
    fixture.detectChanges()
    expect(component).toBeTruthy()
  })

  it('should initialize quantity options correctly', () => {
    fixture.detectChanges()
    expect(component.quantityOptions.length).toBe(10)
    expect(component.quantityOptions[0]).toBe(1)
    expect(component.quantityOptions[9]).toBe(10)
  })

  it('should limit quantity options to maxQuantity if less than 10', () => {
    component.maxQuantity = 5
    fixture.detectChanges()

    expect(component.quantityOptions.length).toBe(5)
    expect(component.quantityOptions[0]).toBe(1)
    expect(component.quantityOptions[4]).toBe(5)
  })

  it('should call addToCart method with correct parameters', () => {
    fixture.detectChanges()

    component.quantity = 3

    component.addtoCart()

    expect(appCartServiceSpy.addToCart).toHaveBeenCalledWith('test-product-id', 3)
  })

  it('should handle loading state during addToCart', () => {
    appCartServiceSpy.addToCart.and.callFake(() => {
      component.addToCartLoading = true
      return of({}).pipe(
        finalize(() => {
          component.addToCartLoading = false
        })
      )
    })

    fixture.detectChanges()

    component.addtoCart()

    expect(appCartServiceSpy.addToCart).toHaveBeenCalled()
    expect(component.addToCartLoading).toBeFalsy()
  })

  it('should display product details correctly', () => {
    fixture.detectChanges()

    const nameElement = fixture.debugElement.query(By.css('.product-name'))
    expect(nameElement.nativeElement.textContent).toContain('Test Product')

    const productMetaElements = fixture.debugElement.queryAll(By.css('.product-meta app-text'))
    const postedByText = productMetaElements[1]?.nativeElement.textContent
    expect(postedByText).toContain('Posted By:')
    expect(postedByText).toContain('Test User')
  })
})
