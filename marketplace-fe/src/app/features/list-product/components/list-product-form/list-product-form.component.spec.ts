import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Categories } from '../../../products/models'


import { ListProductFormComponent } from './list-product-form.component'


describe('ListProductFormComponent', () => {
 let component: ListProductFormComponent
 let fixture: ComponentFixture<ListProductFormComponent>


 beforeEach(async () => {
   await TestBed.configureTestingModule({
     imports: [ListProductFormComponent],
   }).compileComponents()


   fixture = TestBed.createComponent(ListProductFormComponent)
   component = fixture.componentInstance
   fixture.detectChanges()
 })


 it('should create', () => {
   expect(component).toBeTruthy()
 })


 it('should return category values from Categories enum', () => {
   const fixture = TestBed.createComponent(ListProductFormComponent)
   const component = fixture.componentInstance
   const expected = Object.values(Categories)
   expect(component.categoryValues).toEqual(expected)
 })
})




