import { Component, effect, OnInit, ViewEncapsulation } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {GuideService} from "src/app/poll/poll/services/guide.service";
import { PollStepperService } from "./features/poll-stepper/services/poll-stepper.service";
import { PollStepperInterface } from "./features/poll-stepper/interfaces/poll-stepper.interface";
import {TelegramService} from "../../core/tg/telegram.service";

@Component({
  selector: 'app-poll',
  standalone: false,
  templateUrl: './poll.component.html',
  styleUrl: './poll.component.scss',
  providers: [PollStepperService],
  encapsulation: ViewEncapsulation.None
})
export class PollComponent implements OnInit {
  isStarted = false;
  constructor(
    private pollStepperService: PollStepperService,
    private route: ActivatedRoute,
    private guideService: GuideService,
    private telegramService: TelegramService,
  ) {
    effect(() => {
      const state = this.pollStepperService.getState()();

      if (this.isFormCompleted(state)) {
        const result = this.buildSurveyResultMessage(state);
        console.log('Результат:', result);
      }
    });
  }

  ngOnInit(): void {
    this.setState();
  }

  startGuide(): void {
    this.isStarted = true;
  }

  private setState(): void {
    const type = this.route.snapshot.queryParams['type'];
    const questions: PollStepperInterface[] = this.guideService.getGuideByType(type);

    this.pollStepperService.setStepper(questions);
  }

// {
//   type: 'phone',
//   fieldName: 'phone',
//   question: 'Введіть свій номер телефону, щоб отримати чек-лист 📲',
//   required: true,
//   value: '',
//   valueMessenger: '',
// },

  private isFormCompleted(steps: PollStepperInterface[]): boolean {
    return steps.every(step => {
      if (step.type === 'choice') {
        return !!step.selectedAnswer;
      }
      if (step.type === 'phone') {
        return !!step.value?.trim();
      }
      return true;
    });
  }

  private buildSurveyResultMessage(steps: PollStepperInterface[]): string {
    return steps
      .map(step => {
        if (step.type === 'choice') {
          const selected = step.answers.find(a => a.value === step.selectedAnswer);
          return `${step.question} — ${selected ? selected.title : '(не вибрано)'}`;
        }
        if (step.type === 'phone') {
          return `${step.question} — ${step.value}`;
        }
        return '';
      })
      .join('\n');
  }
}
