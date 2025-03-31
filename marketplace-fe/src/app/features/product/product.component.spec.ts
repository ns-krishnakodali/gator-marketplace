import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { ProductComponent } from './product.component';
import { ProductService } from './services';

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  
  const mockProductId = '84db83a5-7137-4541-9bbf-844c3d162645';
  
  const mockProductDetails = {
    pid: mockProductId,
    name: 'Sports-product 27',
    description: 'This is a sample description for product 27',
    price: 75.8,
    category: 'Sports',
    postedBy: 'GatorUser',
    postedAt: new Date('2025-03-30T23:48:15.295084-04:00'),
    quantity: 92,
    PopularityScore: 9.83,
    updatedAt: new Date('2025-03-30T23:48:15.295084-04:00'),
    productImages: [
      {
        id: 27,
        src: 'https://cdn.dummyjson.com/products/images/groceries/Apple/1.png',
        isMain: true,
      },
    ],
  };

  beforeEach(async () => {
    // Create spies
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getProductDetails'], {
      isLoading$: of(false),
      productDetails$: of({ productDetails: mockProductDetails })
    });

    const activatedRouteSpy = {
      snapshot: {
        paramMap: {
          get: () => mockProductId
        }
      }
    };

    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA], 
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: 'AppCartService', useValue: {} }, // Empty mock
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getProductDetails with correct ID on init', () => {
    fixture.detectChanges();
    expect(productServiceSpy.getProductDetails).toHaveBeenCalledWith(mockProductId);
  });
});