import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CommonModule } from '@angular/common'
import { By } from '@angular/platform-browser'
import { ActivatedRoute, RouterModule } from '@angular/router'

import { LandingPageComponent } from './landing-page.component'
import { LandingPageCardComponent } from './components'
import { LandingPageService } from './services'

import { NavbarComponent } from '../../shared-ui'

describe('LandingPageComponent', () => {
  let component: LandingPageComponent
  let fixture: ComponentFixture<LandingPageComponent>
  let landingPageServiceSpy: jasmine.SpyObj<LandingPageService>

  beforeEach(async () => {
    landingPageServiceSpy = jasmine.createSpyObj('LandingPageService', ['navigateTo'])

    const activatedRouteMock = {
      snapshot: { params: {} },
    }

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule, LandingPageCardComponent, NavbarComponent],
      providers: [
        { provide: LandingPageService, useValue: landingPageServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(LandingPageComponent)
    component = fixture.componentInstance
  })
  it('should create the landing page component', () => {
    expect(component).toBeTruthy()
  })

  it('should pass the correct input to the NavbarComponent', () => {
    fixture.detectChanges()
    const navbarComponent = fixture.debugElement.query(By.css('app-navbar')).componentInstance
    expect(navbarComponent.showAccount).toBeTrue()
  })

  it('should render two cards in the cards-container', () => {
    const cards = fixture.debugElement.queryAll(By.css('.cards-container app-landing-page-card'))
    expect(cards.length).toBe(2)
  })

  it('should call navigateTo with correct URL when onExploreMarketplaceClick is called', () => {
    component.onExploreMarketplaceClick()
    expect(landingPageServiceSpy.navigateTo).toHaveBeenCalledWith('/products')
  })

  it('should call navigateTo with correct URL when onListProductsClick is called', () => {
    component.onListProductsClick()
    expect(landingPageServiceSpy.navigateTo).toHaveBeenCalledWith('/list-product')
  })
})
