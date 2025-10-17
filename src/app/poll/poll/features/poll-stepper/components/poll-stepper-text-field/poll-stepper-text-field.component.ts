// components/poll-stepper-phone-field/poll-stepper-phone-field.component.ts
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { PollStepperInterface } from '../../interfaces/poll-stepper.interface';
import { PollStepperService } from '../../services/poll-stepper.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-poll-stepper-text-field',
  standalone: true,
  imports: [NgIf],
  templateUrl: './poll-stepper-text-field.component.html',
  styleUrl: './poll-stepper-text-field.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PollStepperTextFieldComponent {
  @Input() field!: PollStepperInterface;

  touched = false;
  isSave = false;
  displayValue = '';
  selectedMessenger: 'telegram' | 'viber' | null = null;
  phone = '';

  constructor(private pollStepperService: PollStepperService) {}

  /** Перевірка валідності */
  get isValid(): boolean {
    return this.validate(this.field?.value ?? '');
  }

  /** Автопідстановка +380 при фокусі */
  onFocus(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.value.trim()) {
      input.value = '+380';
      this.displayValue = '+380';
    }
  }

  /** Обробка вводу */
  onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let raw = input.value;

    // автоматично додаємо "+" якщо стерли
    if (!raw.startsWith('+')) {
      raw = '+' + raw.replace(/\D+/g, '');
    }

    // лишаємо тільки "+" і цифри
    const cleaned = raw.replace(/(?!^\+)\D+/g, '');

    // обмежуємо довжину (мінімум 6, максимум 15 цифр)
    const limited = cleaned.replace(/^(\+\d{0,15}).*$/, '$1');

    this.phone = limited;
    this.displayValue = limited;

    this.pollStepperService.updateValue(this.field.fieldName, limited, this.selectedMessenger);
  }

  /** Вибір месенджера */
  selectMessenger(type: 'telegram' | 'viber') {
    this.selectedMessenger = type;
    this.pollStepperService.updateValue(this.field.fieldName, this.phone, this.selectedMessenger);
  }

  /** Збереження телефону */
  savePhone(): void {
    this.touched = true;
    this.isSave = true;
    if (this.isValid && this.selectedMessenger) {
      this.pollStepperService.setFinish();
    }
  }

  /** Валідатор: + і 6–15 цифр */
  private validate(value: string): boolean {
    return /^\+\d{6,15}$/.test(value);
  }

  /** Ініціалізація */
  ngOnInit() {
    const val = this.field?.value ?? '';
    this.displayValue = val || '+380';
  }
}
