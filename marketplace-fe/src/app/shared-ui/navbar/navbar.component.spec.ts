import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { RouterModule, ActivatedRoute } from '@angular/router'
import { of } from 'rxjs'

import { NavbarComponent } from './navbar.component'
import { NavbarService } from './navbar.service'
import { InputComponent } from '../input/input.component'

describe('NavbarComponent', () => {
  let component: NavbarComponent
  let fixture: ComponentFixture<NavbarComponent>
  let navbarServiceSpy: jasmine.SpyObj<NavbarService>

  beforeEach(async () => {
    navbarServiceSpy = jasmine.createSpyObj('NavbarService', ['navigateToLandingPage'])

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, InputComponent, RouterModule],
      providers: [
        { provide: NavbarService, useValue: navbarServiceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: of({}) } } },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(NavbarComponent)
    component = fixture.componentInstance
  })

  it('should create the navbar component', () => {
    expect(component).toBeTruthy()
  })

  it('should call goToLandingPage when the logo is clicked', () => {
    spyOn(component, 'goToLandingPage')
    const logoElement = fixture.debugElement.query(By.css('.gator-marketplace')).nativeElement
    logoElement.click()
    expect(component.goToLandingPage).toHaveBeenCalled()
  })

  it('should call goToLandingPage when the enter key is pressed on the logo', () => {
    spyOn(component, 'goToLandingPage')
    const logoElement = fixture.debugElement.query(By.css('.gator-marketplace')).nativeElement
    logoElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(component.goToLandingPage).toHaveBeenCalled()
  })

  it('should display search bar when showSearchBar is true', () => {
    component.showSearchBar = true
    fixture.detectChanges()
    const searchBarElement = fixture.debugElement.query(By.css('.search-bar'))
    expect(searchBarElement).toBeTruthy()
  })

  it('should not display search bar when showSearchBar is false', () => {
    component.showSearchBar = false
    fixture.detectChanges()
    const searchBarElement = fixture.debugElement.query(By.css('.search-bar'))
    expect(searchBarElement).toBeNull()
  })

  it('should display My Account link when showAccount is true', () => {
    component.showAccount = true
    fixture.detectChanges()
    const accountLink = fixture.debugElement.query(By.css('.navbar-link a'))
    expect(accountLink.nativeElement.textContent).toBe('My Account')
  })

  it('should not display My Account link when showAccount is false', () => {
    component.showAccount = false
    fixture.detectChanges()
    const accountLink = fixture.debugElement.query(By.css('.navbar-link a'))
    expect(accountLink).toBeNull()
  })

  it('should display Cart link when showCart is true', () => {
    component.showCart = true
    fixture.detectChanges()
    const cartLink = fixture.debugElement.query(By.css('.navbar-link a'))
    expect(cartLink.nativeElement.textContent).toBe('Cart')
  })

  it('should not display Cart link when showCart is false', () => {
    component.showCart = false
    fixture.detectChanges()
    const cartLink = fixture.debugElement.query(By.css('.navbar-link a'))
    expect(cartLink).toBeNull()
  })

  it('should call NavbarService.navigateToLandingPage when goToLandingPage is called', () => {
    component.goToLandingPage()
    expect(navbarServiceSpy.navigateToPage).toHaveBeenCalled()
  })
})
