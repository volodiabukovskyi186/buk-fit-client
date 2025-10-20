import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { PollStepperInterface } from '../../interfaces/poll-stepper.interface';
import { PollStepperService } from '../../services/poll-stepper.service';

@Component({
  selector: 'app-poll-stepper-text-field',
  standalone: true,
  imports: [NgIf, NgxMaskDirective],
  templateUrl: './poll-stepper-text-field.component.html',
  styleUrls: ['./poll-stepper-text-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [provideNgxMask()],
})
export class PollStepperTextFieldComponent {
  @Input() field!: PollStepperInterface;

  /** Стан введення */
  touched = false;
  isSave = false;

  /** Значення телефону */
  displayValue = '';
  phone = '';

  /** Маска для номера (міжнародна) */
  phoneMask = '+000 00 000 00 00';

  /** Вибраний месенджер */
  selectedMessenger: 'telegram' | 'viber' | null = null;

  constructor(private pollStepperService: PollStepperService) {}

  /** Геттер валідності */
  get isValid(): boolean {
    return this.validate(this.phone);
  }

  /** Коли фокусуємо поле — підставляємо +380 */
  onFocus(e: Event): void {
    const input = e.target as HTMLInputElement;

    if (!input.value.trim()) {
      input.value = '+380';
      this.displayValue = '+380';
    }

    // 🟢 Після автопідстановки переміщуємо курсор у кінець
    const len = input.value.length;
    setTimeout(() => {
      input.setSelectionRange(len, len);
    }, 100);
  }

  /** Обробка вводу */
  onInput(e: Event): void {
    const input = e.target as HTMLInputElement;

    // видаляємо пробіли (які додає маска)
    const cleaned = input.value.replace(/\s+/g, '');

    // оновлюємо локальні змінні
    this.phone = cleaned;
    this.displayValue = input.value;

    // передаємо у сервіс для збереження
    this.pollStepperService.updateValue(
      this.field.fieldName,
      cleaned,
      this.selectedMessenger
    );
  }

  /** Вибір месенджера */
  selectMessenger(type: 'telegram' | 'viber'): void {
    this.selectedMessenger = type;
    this.pollStepperService.updateValue(
      this.field.fieldName,
      this.phone,
      this.selectedMessenger
    );
  }

  /** Збереження телефону (при кліку на кнопку) */
  savePhone(): void {
    this.touched = true;
    this.isSave = true;

    if (this.isValid && this.selectedMessenger) {
      this.pollStepperService.setFinish();
    }
  }

  /** Валідатор формату: + і 6–15 цифр */
  private validate(value: string): boolean {
    return /^\+\d{6,15}$/.test(value);
  }

  /** Ініціалізація початкового стану */
  ngOnInit(): void {
    const val = this.field?.value ?? '';
    this.displayValue = val || '+380';
    this.phone = this.displayValue;
  }
}
