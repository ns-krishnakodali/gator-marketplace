import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextComponent } from './text.component';
import { By } from '@angular/platform-browser';

describe('TextComponent', () => {
  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
  });

  it('should create the text component', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the correct size class', () => {
    component.size = 'large';
    fixture.detectChanges();
    const textElement = fixture.debugElement.query(By.css('.text')).nativeElement;
    expect(textElement.classList).toContain('large');
  });

  it('should set the correct id attribute', () => {
    component.id = 'text-1';
    fixture.detectChanges();
    const textElement = fixture.debugElement.query(By.css('.text')).nativeElement;
    expect(textElement.id).toBe('text-1');
  });
});
