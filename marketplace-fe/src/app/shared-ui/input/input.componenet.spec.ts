import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { By } from '@angular/platform-browser';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
  });

  it('should create the input component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct placeholder', () => {
    component.placeholder = 'Enter text';
    fixture.detectChanges();
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputElement.placeholder).toBe('Enter text');
  });

  it('should emit value changes when input is typed', () => {
    spyOn(component.valueChange, 'emit');
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.value = 'New Value';
    inputElement.dispatchEvent(new Event('input'));
    expect(component.valueChange.emit).toHaveBeenCalledWith('New Value');
  });

  it('should set readonly attribute when readOnly is true', () => {
    component.readOnly = true;
    fixture.detectChanges();
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputElement.readOnly).toBeTrue();
  });
});
