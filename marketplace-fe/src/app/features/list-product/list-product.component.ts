import { Component } from '@angular/core'

import { MatButtonModule } from '@angular/material/button'

import { ListProductFormComponent, ProductImagesComponent } from './components'
import { NavbarComponent } from '../../shared-ui'

@Component({
  selector: 'app-list-product',
  imports: [MatButtonModule, NavbarComponent, ListProductFormComponent, ProductImagesComponent],
  templateUrl: './list-product.component.html',
  styleUrl: './list-product.component.css',
})
export class ListProductComponent {}
