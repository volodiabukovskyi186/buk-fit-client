import {Component, Input, ViewEncapsulation} from '@angular/core';
import {PollStepperInterface} from "../../interfaces/poll-stepper.interface";
import {NgForOf} from "@angular/common";
import {PollStepperService} from "../../services/poll-stepper.service";

@Component({
  selector: 'app-poll-stepper-field',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './poll-tariff-field.component.html',
  styleUrl: './poll-tariff-field.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PollTariffFieldComponent {
  @Input() field: PollStepperInterface;

  constructor(private pollStepperService: PollStepperService) {}

  selectAnswer(price): void {
    const answerValue =price;

    this.field.selectedAnswer = answerValue;

    this.pollStepperService.selectAnswer(this.field.fieldName, answerValue);
  }
}
