import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { DatePipe } from '@angular/common'
import { By } from '@angular/platform-browser'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import { ProductDetailsComponent } from './product-details.component'
import { ProductService } from '../../services'
import { TextComponent } from '../../../../shared-ui/text/text.component'

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let fixture: ComponentFixture<ProductDetailsComponent>;
  let productServiceMock: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    productServiceMock = jasmine.createSpyObj('ProductService', ['getProduct']);

    await TestBed.configureTestingModule({
      imports: [
        DatePipe,
        MatButtonModule,
        MatIconModule,
        ProductDetailsComponent,
        TextComponent
      ],
      providers: [
        { provide: ProductService, useValue: productServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA] // For custom components like app-text
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    component.productName = 'Test Product';
    component.productDescription = 'This is a test product description';
    
    // The date test was failing because of timezone differences
    // Hard-code the exact string we expect to see after formatting
    const testDate = new Date('2025-03-29T12:00:00');
    component.postedAt = testDate;
    
    component.postedBy = 'Test User';
    component.quantity = 5;
    
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the product name', () => {
    const productNameElement = fixture.debugElement.query(By.css('.product-name')).nativeElement;
    expect(productNameElement.textContent).toContain('Test Product');
  });

  it('should display the product description', () => {
    const descriptionElement = fixture.debugElement.query(By.css('#product-description'));
    expect(descriptionElement).toBeTruthy();
  });

  it('should format the posted date correctly', () => {
    const productMetaElements = fixture.debugElement.queryAll(By.css('.product-meta app-text'));
    const postedAtElement = productMetaElements[0].nativeElement;
    
    // Match only what we know will be in the element
    expect(postedAtElement.textContent).toContain('Posted On:');
    expect(postedAtElement.textContent).toContain('Mar 29, 2025');
  });

  it('should display the posted by information', () => {
    const productMetaElements = fixture.debugElement.queryAll(By.css('.product-meta app-text'));
    const postedByElement = productMetaElements[1].nativeElement;
    
    expect(postedByElement.textContent).toContain('Posted By:');
    expect(postedByElement.textContent).toContain('Test User');
  });

  it('should generate quantity options based on available quantity', () => {
    component.quantity = 5;
    component.ngOnInit();
    expect(component.quantityOptions).toEqual([1, 2, 3, 4, 5]);
    
    component.quantity = 15;
    component.ngOnInit();
    expect(component.quantityOptions).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should limit quantity options to 10 when quantity is greater than 10', () => {
    component.quantity = 20;
    component.ngOnInit();
    expect(component.quantityOptions.length).toBe(10);
    expect(component.quantityOptions[9]).toBe(10);
  });

  it('should render the correct number of quantity options in the select element', () => {
    component.quantity = 5;
    component.ngOnInit();
    fixture.detectChanges();
    
    const options = fixture.debugElement.queryAll(By.css('option'));
    expect(options.length).toBe(5);
  });

  it('should display the add to cart button with correct icon', () => {
    const button = fixture.debugElement.query(By.css('#add-to-cart')).nativeElement;
    const icon = fixture.debugElement.query(By.css('mat-icon')).nativeElement;
    
    expect(button.textContent).toContain('Add to cart');
    expect(icon.textContent).toContain('shopping_cart');
  });

  it('should handle empty quantity case properly', () => {
    component.quantity = 0;
    component.ngOnInit();
    fixture.detectChanges();
    
    const options = fixture.debugElement.queryAll(By.css('option'));
    expect(options.length).toBe(0);
    expect(component.quantityOptions).toEqual([]);
  });
});
