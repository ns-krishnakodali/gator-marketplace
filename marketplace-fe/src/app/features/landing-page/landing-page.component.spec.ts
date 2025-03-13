import { CommonModule } from '@angular/common'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { By } from '@angular/platform-browser'
import { ActivatedRoute, RouterModule } from '@angular/router'

import { BehaviorSubject } from 'rxjs'

import { LandingPageComponent } from './landing-page.component'
import { LandingPageCardComponent } from './components'
import { LandingPageService } from './services'
import { NavbarComponent } from '../../shared-ui'

describe('LandingPageComponent', () => {
  let component: LandingPageComponent
  let fixture: ComponentFixture<LandingPageComponent>
  let landingPageServiceSpy: jasmine.SpyObj<LandingPageService>
  let isLoadingSubject: BehaviorSubject<boolean>

  beforeEach(async () => {
    isLoadingSubject = new BehaviorSubject<boolean>(false)

    landingPageServiceSpy = jasmine.createSpyObj(
      'LandingPageService',
      ['navigateTo', 'callProtectedEndpoint'],
      { isLoading$: isLoadingSubject.asObservable() }
    )

    const activatedRouteMock = {
      snapshot: { params: {} },
    }

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule,
        MatProgressSpinnerModule,
        LandingPageCardComponent,
        NavbarComponent,
      ],
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

  it('should call callProtectedEndpoint on component initialization', () => {
    fixture.detectChanges()
    expect(landingPageServiceSpy.callProtectedEndpoint).toHaveBeenCalled()
  })

  it('should display loader when isLoading$ is true', () => {
    isLoadingSubject.next(true)
    fixture.detectChanges()

    const spinner = fixture.debugElement.query(By.css('mat-spinner'))
    expect(spinner).toBeTruthy()
  })

  it('should not display loader when isLoading$ is false', () => {
    isLoadingSubject.next(false)
    fixture.detectChanges()

    const spinner = fixture.debugElement.query(By.css('mat-spinner'))
    expect(spinner).toBeFalsy()
  })

  it('should pass the correct input to the NavbarComponent', () => {
    fixture.detectChanges()
    const navbarComponent = fixture.debugElement.query(By.css('app-navbar')).componentInstance
    expect(navbarComponent.showAccount).toBeTrue()
  })

  it('should render two cards when not loading', () => {
    isLoadingSubject.next(false)
    fixture.detectChanges()

    const cards = fixture.debugElement.queryAll(By.css('.cards-container app-landing-page-card'))
    expect(cards.length).toBe(2)
  })

  it('should not render cards when loading', () => {
    isLoadingSubject.next(true)
    fixture.detectChanges()

    const cards = fixture.debugElement.queryAll(By.css('.cards-container app-landing-page-card'))
    expect(cards.length).toBe(0)
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
