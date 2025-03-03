import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'

import { TextComponent } from './text.component'

describe('TextComponent', () => {
  let component: TextComponent
  let fixture: ComponentFixture<TextComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(TextComponent)
    component = fixture.componentInstance
  })

  it('should create the text component', () => {
    expect(component).toBeTruthy()
  })

  it('should apply the default size "medium" if no size is provided', () => {
    fixture.detectChanges()
    const textElement = fixture.debugElement.query(By.css('p')).nativeElement
    expect(textElement.classList).toContain('medium')
  })

  it('should apply the correct size class based on the input size', () => {
    component.size = 'x-large'
    fixture.detectChanges()
    const textElement = fixture.debugElement.query(By.css('p')).nativeElement
    expect(textElement.classList).toContain('x-large')
  })

  it('should apply the correct id', () => {
    component.id = 'test-id'
    fixture.detectChanges()
    const textElement = fixture.debugElement.query(By.css('p')).nativeElement
    expect(textElement.id).toBe('test-id')
  })

  it('should render the content projected using ng-content', () => {
    const projectedContent = 'This is a test content'
    component.id = 'test-id'
    fixture.detectChanges()
    const textElement = fixture.debugElement.query(By.css('p')).nativeElement
    textElement.innerHTML = projectedContent
    expect(textElement.innerHTML).toContain(projectedContent)
  })
})
