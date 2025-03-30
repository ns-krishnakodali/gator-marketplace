import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-order-summary-card',
  templateUrl: './order-summary-card.component.html',
  styleUrls: ['./order-summary-card.component.css']
})
export class OrderSummaryCardComponent {
  @Input() itemsTotal: number = 0;
  @Input() handlingFees: number = 0;

  // Computed total: items total + handling fees
  get total(): number {
    return this.itemsTotal + this.handlingFees;
  }
}
