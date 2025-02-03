import { Component, Input } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

type InputType = "text" | "number" | "email" | "password" | "checkbox";

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [MatInputModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
})
export class InputComponent {
  @Input() inputType: InputType = "text";
  @Input() inputLabel: string = "";
  @Input() inputValue!: string | number | boolean;
  @Input() inputPlaceholder: string = "";
  @Input() required: boolean = false;
}
