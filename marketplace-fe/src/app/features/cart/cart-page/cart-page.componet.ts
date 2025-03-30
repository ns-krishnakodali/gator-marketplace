import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cart-card',
  templateUrl: './cart-card.component.html',
  styleUrls: ['./cart-card.component.css']
})
export class CartCardComponent {
  @Input() item: any;
  @Output() remove = new EventEmitter<void>();
  @Output() quantityChange = new EventEmitter<number>();

  quantityOptions = [1, 2, 3, 4, 5];

  onRemoveClick(event: Event) {
    event.preventDefault();
    this.remove.emit();
  }

  onQuantityChange(qty: number) {
    this.quantityChange.emit(+qty);
  }
}
