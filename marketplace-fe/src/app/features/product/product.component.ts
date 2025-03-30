import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  products = [
    { name: 'Product 1', image: 'assets/images/product1.jpg', description: 'Description for Product 1' },
    { name: 'Product 2', image: 'assets/images/product2.jpg', description: 'Description for Product 2' },
    { name: 'Product 3', image: 'assets/images/product3.jpg', description: 'Description for Product 3' }
  ];

  selectedProduct: any = null;

  selectProduct(product: any) {
    this.selectedProduct = product;
  }
}
