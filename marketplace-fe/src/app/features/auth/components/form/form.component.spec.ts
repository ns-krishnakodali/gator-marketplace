import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormComponent } from './form.component';
import { TextComponent } from '../../../../shared-ui/';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormComponent, TextComponent],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the form component', () => {
    
    (component).toBeTruthy();
  });

  it('should render the form heading correctly', () => {
    component.heading = 'Test Heading';
    fixture.detectChanges();
    
    const headingElement = fixture.debugElement.query(By.css('.form-header app-text')).nativeElement;
    expect(headingElement.textContent).toContain('Test Heading');
  });

  it('should set the correct id on the container', () => {
    component.id = 'test-id';
    fixture.detectChanges();
    
    const container = fixture.debugElement.query(By.css('.form-container')).nativeElement;
    expect(container.id).toBe('test-id');
  });

  it('should emit submitForm event when form is submitted', () => {
    spyOn(component.submitForm, 'emit');

    const formElement = fixture.debugElement.query(By.css('form')).nativeElement;
    formElement.dispatchEvent(new Event('submit'));
    
    expect(component.submitForm.emit).toHaveBeenCalled();
  });

});
