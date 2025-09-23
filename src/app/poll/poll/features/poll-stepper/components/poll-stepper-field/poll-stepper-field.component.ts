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
  templateUrl: './poll-stepper-field.component.html',
  styleUrl: './poll-stepper-field.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PollStepperFieldComponent {
  @Input() field: PollStepperInterface;

  constructor(private pollStepperService: PollStepperService) {}

  selectAnswer(index: number): void {
    const answerValue = this.field.answers[index].value;

    this.field.selectedAnswer = answerValue;

    this.pollStepperService.selectAnswer(this.field.fieldName, answerValue);
  }
}
