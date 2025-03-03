import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatCardModule } from '@angular/material/card'
import { By } from '@angular/platform-browser'

import { LandingPageCardComponent } from './landing-page-card.component'
import { TextComponent } from '../../../../shared-ui/'

describe('LandingPageCardComponent', () => {
  let component: LandingPageCardComponent
  let fixture: ComponentFixture<LandingPageCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageCardComponent, MatCardModule, TextComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(LandingPageCardComponent)
    component = fixture.componentInstance

    component.cardTitle = 'Test Card Title'
    component.cardDescription = 'Test Card Description'
    component.iconSrc = 'test-icon.png'
    component.iconAlt = 'Test Icon'
    component.onCardClick = jasmine.createSpy('onCardClick')

    fixture.detectChanges()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should display the correct title and description', () => {
    const titleElement = fixture.debugElement.query(By.css('#card-title')).nativeElement
    const descriptionElement = fixture.debugElement.query(By.css('#card-decription')).nativeElement
    expect(titleElement.textContent.trim()).toBe('Test Card Title')
    expect(descriptionElement.textContent.trim()).toBe('Test Card Description')
  })

  it('should set the correct image source and alt attributes', () => {
    const imageElement = fixture.debugElement.query(By.css('.card-image')).nativeElement
    expect(imageElement.src).toContain('test-icon.png')
    expect(imageElement.alt).toBe('Test Icon')
  })

  it('should call onCardClick when card is clicked', () => {
    const cardElement = fixture.debugElement.query(By.css('.card'))
    cardElement.triggerEventHandler('click', null)
    expect(component.onCardClick).toHaveBeenCalled()
  })
})
