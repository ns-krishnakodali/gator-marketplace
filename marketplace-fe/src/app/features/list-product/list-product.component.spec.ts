import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of } from 'rxjs'

import { ListProductComponent } from './list-product.component'
import { ListProductService } from './services'
import type { ProductDetails } from './models'

import { ProductImagesComponent } from './components/product-images/product-images.component'

describe('ListProductComponent', () => {
  let component: ListProductComponent
  let fixture: ComponentFixture<ListProductComponent>
  let listServiceSpy: jasmine.SpyObj<ListProductService>

  beforeEach(async () => {
    listServiceSpy = jasmine.createSpyObj('ListProductService', ['listProduct'], {
      isLoading$: of(false),
    })

    await TestBed.configureTestingModule({
      imports: [ListProductComponent],
      providers: [{ provide: ListProductService, useValue: listServiceSpy }],
    }).compileComponents()

    fixture = TestBed.createComponent(ListProductComponent)
    component = fixture.componentInstance
    // stub child component properties
    component.listProductForm = {
      productDetails: {
        name: 'Test',
        description: 'Desc',
        price: 9,
        category: 'Cat',
        quantity: 3,
      } as ProductDetails,
      categoryValues: [], // added categoryValues property to satisfy ListProductFormComponent type
    }

    component.productImages = {
      imageFiles: [new File([], 'img.png')],
      imagePreviews: [],
      listProductService: {} as ListProductService,
      onImagesSelected: () => {
        /* no-op */
      },
      onDragOver: () => {
        /* no-op */
      },
      onDrop: () => {
        /* no-op */
      },
      removeImage: () => {
        /* no-op */
      },
      addImages: () => {
        /* no-op */
      },
    } as unknown as ProductImagesComponent
  })
})
