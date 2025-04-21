import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ProductsComponent } from './products.component'
import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-product-card',
  template: '<div>{{ product?.name }}</div>',
})
class MockProductCardComponent {
  @Input() product: any
}

describe('ProductsComponent', () => {
  let component: ProductsComponent
  let fixture: ComponentFixture<ProductsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductsComponent, MockProductCardComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ProductsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
