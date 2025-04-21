import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Component, Input } from '@angular/core'
import { of } from 'rxjs'

import { ListProductComponent } from './list-product.component'
import { ListProductService } from './services'
import { ProductDetails } from './models'

@Component({ selector: 'app-list-product-form', template: '' })
class MockListProductFormComponent {
  productDetails: ProductDetails = {
    name: 'Mock Product',
    description: 'Test',
    price: 99.99,
    category: 'Books',
    quantity: 10,
  }
}

@Component({ selector: 'app-product-images', template: '' })
class MockProductImagesComponent {
  imageFiles: File[] = [new File(['dummy'], 'test.jpg', { type: 'image/jpeg' })]
}

describe('ListProductComponent', () => {
  let component: ListProductComponent
  let fixture: ComponentFixture<ListProductComponent>
  let mockService: jasmine.SpyObj<ListProductService>

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ListProductService', ['listProduct'], {
      isLoading$: of(false),
    })

    await TestBed.configureTestingModule({
      declarations: [ListProductComponent, MockListProductFormComponent, MockProductImagesComponent],
      providers: [{ provide: ListProductService, useValue: mockService }],
    }).compileComponents()

    fixture = TestBed.createComponent(ListProductComponent)
    component = fixture.componentInstance

    // Manually inject child components
    component.listProductForm = fixture.debugElement.children[0].componentInstance
    component.productImages = fixture.debugElement.children[1].componentInstance

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call listProductService with correct data on submit', () => {
    const mockEvent = new Event('submit')
    component.onListProduct(mockEvent)

    expect(mockService.listProduct).toHaveBeenCalledWith(
      component.listProductForm.productDetails,
      component.productImages.imageFiles
    )
  })
})
