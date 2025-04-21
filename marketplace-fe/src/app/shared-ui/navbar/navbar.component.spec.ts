import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterModule } from '@angular/router'
import { provideRouter } from '@angular/router'
import { BehaviorSubject } from 'rxjs'

import { NavbarComponent } from './navbar.component'
import { AppCartService } from '../../core'

class MockAppCartService {
  private cartProductsCountSubject = new BehaviorSubject<string>('0')
  getCartProductsCount$ = this.cartProductsCountSubject.asObservable()

  getCartProductsCount() {
    this.cartProductsCountSubject.next('3')
  }
}

describe('NavbarComponent', () => {
  let component: NavbarComponent
  let fixture: ComponentFixture<NavbarComponent>
  let mockCartService: MockAppCartService

  beforeEach(async () => {
    mockCartService = new MockAppCartService()

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterModule],
      providers: [provideRouter([]), { provide: AppCartService, useValue: mockCartService }],
    }).compileComponents()

    fixture = TestBed.createComponent(NavbarComponent)
    component = fixture.componentInstance
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should display marketplace title', () => {
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    expect(compiled.querySelector('#marketplace').textContent).toContain('Marketplace')
  })

  it('should not show search bar by default', () => {
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    expect(compiled.querySelector('.search-bar')).toBeNull()
  })

  it('should show search bar when showSearchBar is true', () => {
    component.showSearchBar = true
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    expect(compiled.querySelector('.search-bar')).toBeTruthy()
  })

  it('should not show account link by default', () => {
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    expect(compiled.querySelector('#my-account')).toBeNull()
  })

  it('should show account link when showAccount is true', () => {
    component.showAccount = true
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    expect(compiled.querySelector('#my-account')).toBeTruthy()
  })

  it('should not show cart by default', () => {
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    expect(compiled.querySelector('#cart')).toBeNull()
  })

  it('should show cart when showCart is true', () => {
    component.showCart = true
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    expect(compiled.querySelector('#cart')).toBeTruthy()
  })

  it('should get cart count from service when showCart is true', () => {
    const spy = spyOn(mockCartService, 'getCartProductsCount').and.callThrough()
    component.showCart = true

    fixture.detectChanges()

    expect(spy).toHaveBeenCalled()
    expect(component.cartCount).toBe('3')
  })

  it('should not get cart count from service when showCart is false', () => {
    const spy = spyOn(mockCartService, 'getCartProductsCount').and.callThrough()
    component.showCart = false

    fixture.detectChanges()

    expect(spy).not.toHaveBeenCalled()
  })

  it('should show cart count when cart has items', () => {
    component.showCart = true
    component.cartCount = '3'

    fixture.detectChanges()

    const compiled = fixture.nativeElement
    expect(compiled.querySelector('#cart-items')).toBeTruthy()
    expect(compiled.querySelector('#cart-items').textContent).toContain('(3)')
  })

  it('should have working router links', () => {
    component.showAccount = true
    component.showCart = true

    fixture.detectChanges()

    const compiled = fixture.nativeElement
    const accountLink = compiled.querySelector('[routerLink="/my-account"]')
    const cartLink = compiled.querySelector('[routerLink="/cart"]')
    const homeLink = compiled.querySelector('[routerLink="/"]')

    expect(accountLink).toBeTruthy()
    expect(cartLink).toBeTruthy()
    expect(homeLink).toBeTruthy()
  })
})
