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
  displayValue = ''; // те, що бачить юзер (формат ХХ ХХХ ХХ ХХ)
  get isValid(): boolean { return this.validate(this.field?.value ?? ''); }
  phone
  constructor(private pollStepperService: PollStepperService) {}

  onInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    // лишаємо тільки цифри
    const digits = raw.replace(/\D+/g, '');

    // Якщо ввели з 0 на початку (місцевий формат), зріжемо його
    // і збережемо лише 9 цифр абонентської частини
    const abonent = digits.replace(/^0/, '').slice(0, 9);

    // Зберігаємо у стейт нормалізовано як +380XXXXXXXXX
    const normalized = abonent.length ? `+380${abonent}` : '';

    this.phone = normalized;
    this.pollStepperService.updateValue(this.field.fieldName, normalized, this.selectedMessenger);

    // Відображення у полі: ХХ ХХХ ХХ ХХ
    this.displayValue = this.pretty(abonent);
  }

  selectedMessenger: 'telegram' | 'viber' | null = null;

  selectMessenger(type: 'telegram' | 'viber') {
    this.selectedMessenger = type;

    this.pollStepperService.updateValue(this.field.fieldName,  this.phone, this.selectedMessenger);
  }

  submitIfValid() {
    // this.touched = true;
    // if (this.isValid) {
    //   // тут можна авто-перехід на наступний крок
    //   // наприклад:
    //   this.pollStepperService.nextStep();
    // }
  }

  savePhone(): void {
    this.touched = true;
    this.isSave = true;
    if (this.isValid && this.selectedMessenger) {
      this.pollStepperService.setFinish();
    }
  }

  /** +380XXXXXXXXX */
  private validate(value: string): boolean {
    return /^\+380\d{9}$/.test(value);
  }

  /** Формат показу: ХХ ХХХ ХХ ХХ */
  private pretty(abonent: string): string {
    // групи: 2-3-2-2
    const g1 = abonent.slice(0, 2);
    const g2 = abonent.slice(2, 5);
    const g3 = abonent.slice(5, 7);
    const g4 = abonent.slice(7, 9);
    return [g1, g2, g3, g4].filter(Boolean).join(' ');
  }

  ngOnInit() {
    // якщо в полі вже є value — підставимо у відображення
    const val = this.field?.value ?? '';
    const abonent = val.replace(/^\+?380/, '').replace(/\D+/g, '').slice(0, 9);
    this.displayValue = this.pretty(abonent);
  }
}
