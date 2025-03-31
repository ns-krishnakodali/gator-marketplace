import { CurrencyPipe } from '@angular/common'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { MatButtonModule } from '@angular/material/button'

import { OrderSummaryCardComponent } from './order-summary.component'

describe('OrderSummaryCardComponent', () => {
  let component: OrderSummaryCardComponent
  let fixture: ComponentFixture<OrderSummaryCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderSummaryCardComponent, MatButtonModule],
      providers: [CurrencyPipe],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSummaryCardComponent)
    component = fixture.componentInstance

    // Set input values
    component.productsTotal = '45.99'
    component.handlingFee = '5.00'
    component.totalCost = '50.99'

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('component inputs', () => {
    it('should have required input properties', () => {
      expect(component.productsTotal).toBeDefined()
      expect(component.handlingFee).toBeDefined()
      expect(component.totalCost).toBeDefined()
    })

    it('should set input values correctly', () => {
      expect(component.productsTotal).toBe('45.99')
      expect(component.handlingFee).toBe('5.00')
      expect(component.totalCost).toBe('50.99')
    })
  })

  describe('template rendering', () => {
    it('should render the heading', () => {
      const headingElement = fixture.debugElement.query(
        By.css('.order-summary-heading')
      ).nativeElement
      expect(headingElement.textContent).toBe('Order Summary')
    })

    it('should display products total with currency', () => {
      const orderDetailsElements = fixture.debugElement.queryAll(By.css('.order-details'))
      const productsTotalElement = orderDetailsElements[0].nativeElement

      expect(productsTotalElement.textContent).toContain('Items Total:')
      expect(productsTotalElement.textContent).toContain('$45.99')
    })

    it('should display handling fee with currency', () => {
      const orderDetailsElements = fixture.debugElement.queryAll(By.css('.order-details'))
      const handlingFeeElement = orderDetailsElements[1].nativeElement

      expect(handlingFeeElement.textContent).toContain('Handling Fee:')
      expect(handlingFeeElement.textContent).toContain('$5.00')
    })

    it('should display total cost with currency', () => {
      const totalElement = fixture.debugElement.query(By.css('.total-details')).nativeElement

      expect(totalElement.textContent).toContain('Total:')
      expect(totalElement.textContent).toContain('$50.99')
    })

    it('should render a checkout button', () => {
      const buttonElement = fixture.debugElement.query(By.css('#checkout')).nativeElement

      expect(buttonElement).toBeTruthy()
      expect(buttonElement.textContent.trim()).toBe('Checkout')
      expect(buttonElement.getAttribute('aria-label')).toBe('Checkout')
    })
  })

  describe('input changes', () => {
    it('should update the view when input properties change', () => {
      component.productsTotal = '60.00'
      component.handlingFee = '7.50'
      component.totalCost = '67.50'

      fixture.detectChanges()

      const orderDetailsElements = fixture.debugElement.queryAll(By.css('.order-details'))
      const productsTotalElement = orderDetailsElements[0].nativeElement
      const handlingFeeElement = orderDetailsElements[1].nativeElement
      const totalElement = fixture.debugElement.query(By.css('.total-details')).nativeElement

      expect(productsTotalElement.textContent).toContain('$60.00')
      expect(handlingFeeElement.textContent).toContain('$7.50')
      expect(totalElement.textContent).toContain('$67.50')
    })
  })

  it('should handle zero values correctly', () => {
    component.productsTotal = '0'
    component.handlingFee = '0'
    component.totalCost = '0'

    fixture.detectChanges()

    const orderDetailsElements = fixture.debugElement.queryAll(By.css('.order-details'))
    const productsTotalElement = orderDetailsElements[0].nativeElement
    const handlingFeeElement = orderDetailsElements[1].nativeElement
    const totalElement = fixture.debugElement.query(By.css('.total-details')).nativeElement

    expect(productsTotalElement.textContent).toContain('$0.00')
    expect(handlingFeeElement.textContent).toContain('$0.00')
    expect(totalElement.textContent).toContain('$0.00')
  })

  it('should handle negative values correctly', () => {
    component.productsTotal = '50.00'
    component.handlingFee = '-10.00'
    component.totalCost = '40.00'

    fixture.detectChanges()

    const orderDetailsElements = fixture.debugElement.queryAll(By.css('.order-details'))
    const productsTotalElement = orderDetailsElements[0].nativeElement
    const handlingFeeElement = orderDetailsElements[1].nativeElement
    const totalElement = fixture.debugElement.query(By.css('.total-details')).nativeElement

    expect(productsTotalElement.textContent).toContain('$50.00')
    expect(handlingFeeElement.textContent).toContain('-$10.00')
    expect(totalElement.textContent).toContain('$40.00')
  })
})
