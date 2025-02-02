import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
// import { MatInputModule } from '@angular/material/input';
// import { FormsModule } from '@angular/forms';

type ButtonType = "submit" | "reset" | "button";
// type InputType = "text" | "number" | "email" | "password" | "checkbox";
// type ElementType = "button" | "input" | "text"; 

@Component({
  selector: 'app-button',
  imports: [MatButtonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  @Input() elementType: ButtonType = "button"; 

  // Button Props
  @Input() buttonType: ButtonType = "button";
  @Input() buttonText: string = "Click Me";
  @Input() buttonColor: "primary" | "accent" | "warn" = "primary";
  @Input() disabled: boolean = false;
  @Input() onClickHandler!: () => void;

  // Input Props
  // @Input() inputType: InputType = "text";
  // @Input() inputLabel: string = "";
  // @Input() inputValue: string | number | boolean = "";
  // @Input() inputPlaceholder: string = "";
  // @Input() required: boolean = false;

  // Text Props
//   @Input() textContent: string = "";
//   @Input() fontSize: string = "16px";
//   @Input() textColor: string = "black";
}
