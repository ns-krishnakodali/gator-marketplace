import { CommonModule } from '@angular/common'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { provideRouter } from '@angular/router'

import { InputComponent } from '../input/input.component'
import { NavbarComponent } from './navbar.component'

describe('NavbarComponent', () => {
  let component: NavbarComponent
  let fixture: ComponentFixture<NavbarComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [NavbarComponent, InputComponent],
      providers: [provideRouter([])],
    }).compileComponents()

    fixture = TestBed.createComponent(NavbarComponent)
    component = fixture.componentInstance
  })

  it('should create the navbar component', () => {
    expect(component).toBeTruthy()
  })

  it('should render the marketplace title', () => {
    fixture.detectChanges()
    const title = fixture.debugElement.query(By.css('#marketplace'))
    expect(title.nativeElement.textContent).toContain('Marketplace')
  })

  it('should display the search bar when showSearchBar is true', () => {
    component.showSearchBar = true
    fixture.detectChanges()
    const searchBar = fixture.debugElement.query(By.css('#search-bar'))
    expect(searchBar).toBeTruthy()
  })

  it('should not display the search bar when showSearchBar is false', () => {
    component.showSearchBar = false
    fixture.detectChanges()
    const searchBar = fixture.debugElement.query(By.css('#search-bar'))
    expect(searchBar).toBeFalsy()
  })

  it('should display My Account link when showAccount is true', () => {
    component.showAccount = true
    fixture.detectChanges()
    const accountLink = fixture.debugElement.query(By.css('.navbar-link a[href="/my-account"]'))
    expect(accountLink).toBeTruthy()
  })

  it('should not display My Account link when showAccount is false', () => {
    component.showAccount = false
    fixture.detectChanges()
    const accountLink = fixture.debugElement.query(By.css('.navbar-link a[href="/my-account"]'))
    expect(accountLink).toBeFalsy()
  })

  it('should display Cart link when showCart is true', () => {
    component.showCart = true
    fixture.detectChanges()
    const cartLink = fixture.debugElement.query(By.css('.navbar-link a[href="/my-cart"]'))
    expect(cartLink).toBeTruthy()
  })

  it('should not display Cart link when showCart is false', () => {
    component.showCart = false
    fixture.detectChanges()
    const cartLink = fixture.debugElement.query(By.css('.navbar-link a[href="/my-cart"]'))
    expect(cartLink).toBeFalsy()
  })
})
