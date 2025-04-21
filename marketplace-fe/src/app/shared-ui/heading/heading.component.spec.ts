import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'

import { HeadingComponent } from './heading.component'

describe('HeadingComponent', () => {
  let component: HeadingComponent
  let fixture: ComponentFixture<HeadingComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadingComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(HeadingComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set input properties correctly', () => {
    component.id = 'test-id'
    component.heading = 'Test Heading'
    fixture.detectChanges()

    expect(component.id).toBe('test-id')
    expect(component.heading).toBe('Test Heading')
  })

  it('should render heading text correctly', () => {
    component.heading = 'Hello World'
    fixture.detectChanges()

    const headingElement = fixture.debugElement.query(By.css('.heading'))
    expect(headingElement.nativeElement.textContent).toBe('Hello World')
  })

  it('should set the id attribute on the h1 element', () => {
    component.id = 'custom-id'
    fixture.detectChanges()

    const headingElement = fixture.debugElement.query(By.css('.heading'))
    expect(headingElement.nativeElement.id).toBe('custom-id')
  })

  it('should update rendered heading when input changes', () => {
    component.heading = 'Initial Heading'
    fixture.detectChanges()

    let headingElement = fixture.debugElement.query(By.css('.heading'))
    expect(headingElement.nativeElement.textContent).toBe('Initial Heading')

    component.heading = 'Updated Heading'
    fixture.detectChanges()

    headingElement = fixture.debugElement.query(By.css('.heading'))
    expect(headingElement.nativeElement.textContent).toBe('Updated Heading')
  })
})
