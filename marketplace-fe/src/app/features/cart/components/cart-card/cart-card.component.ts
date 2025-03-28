import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cart-card',
  templateUrl: './cart-card.component.html',
  styleUrls: ['./cart-card.component.css']
})
export class CartCardComponent {
  @Input() item: any;
  @Input() quantityOptions: number[] = [1, 2, 3, 4, 5]; // passed from parent, default 1–5

  @Output() quantityChanged = new EventEmitter<number>();
  @Output() removeItem = new EventEmitter<void>();

  // Triggered when dropdown value changes
  onQuantityChange(value: string): void {
    const qty = parseInt(value, 10);
    if (!isNaN(qty) && qty > 0) {
      this.quantityChanged.emit(qty);
    }
  }

  // Triggered when "Remove Item" link is clicked
  onRemoveClick(event: Event): void {
    event.preventDefault(); // prevent default anchor behavior
    this.removeItem.emit();
  }
}
