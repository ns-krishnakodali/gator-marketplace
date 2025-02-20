import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NavbarComponent } from './navbar.component'
import { RouterTestingModule } from '@angular/router/testing'
import { By } from '@angular/platform-browser'

describe('NavbarComponent', () => {
  let component: NavbarComponent
  let fixture: ComponentFixture<NavbarComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule],
    }).compileComponents()

    fixture = TestBed.createComponent(NavbarComponent)
    component = fixture.componentInstance
  })

  it('should create the navbar component', () => {
    expect(component).toBeTruthy()
  })

  it('should display the title', () => {
    component.title = 'Test App'
    fixture.detectChanges()
    const titleElement = fixture.debugElement.query(By.css('.navbar-brand')).nativeElement
    expect(titleElement.textContent).toContain('Test App')
  })

  it('should render the search bar when showSearch is true', () => {
    component.showSearch = true
    fixture.detectChanges()
    const searchBar = fixture.debugElement.query(By.css('.search-bar'))
    expect(searchBar).toBeTruthy()
  })

  it('should not render the search bar when showSearch is false', () => {
    component.showSearch = false
    fixture.detectChanges()
    const searchBar = fixture.debugElement.query(By.css('.search-bar'))
    expect(searchBar).toBeFalsy()
  })

  it('should render the correct number of navigation links', () => {
    component.links = [
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Profile', path: '/profile' },
    ]
    fixture.detectChanges()
    const links = fixture.debugElement.queryAll(By.css('.navbar-links li'))
    expect(links.length).toBe(3)
  })

  it('should set correct router links for navigation items', () => {
    component.links = [
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard' },
    ]
    fixture.detectChanges()
    const linkElements = fixture.debugElement.queryAll(By.css('.navbar-links a'))
    expect(linkElements[0].nativeElement.getAttribute('ng-reflect-router-link')).toBe('/')
    expect(linkElements[1].nativeElement.getAttribute('ng-reflect-router-link')).toBe('/dashboard')
  })
})
