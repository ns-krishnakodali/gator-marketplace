import { Component, Input } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'

import { SidebarComponent, DisplayProductsComponent } from './components'
import { NavbarComponent } from '../../shared-ui'

import type { ProductData } from './models'

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  imports: [MatPaginator, DisplayProductsComponent, NavbarComponent, SidebarComponent],
})
export class ProductsComponent {
  @Input() products: ProductData[] = []
}
