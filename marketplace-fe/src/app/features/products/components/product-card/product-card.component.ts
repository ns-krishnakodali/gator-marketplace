import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() imageSrc!: string;
  @Input() productName!: string;
  @Input() productPrice!: number;
  @Input() postedDate!: string;

  addToCart() {
  }
}
