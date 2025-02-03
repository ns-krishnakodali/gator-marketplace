import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

type ButtonType = "submit" | "reset" | "button";

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  @Input() buttonType: ButtonType = "button";
  @Input() buttonText: string = "Click Me";
  @Input() buttonColor: "primary" | "accent" | "warn" = "primary";
  @Input() disabled: boolean = false;
  @Input() onClickHandler!: () => void;
}
