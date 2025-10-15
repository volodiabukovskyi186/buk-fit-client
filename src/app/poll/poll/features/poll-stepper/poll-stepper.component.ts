import {
  Component,
  ComponentRef,
  DestroyRef,
  effect,
  inject,
  Type,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from "@angular/router";
import {
  PollStepperWelcomeComponent
} from "src/app/poll/poll/poll-stepper-welcome/poll-stepper-welcome.component";
import {PollStepperService} from './services/poll-stepper.service';
import {PollStepperFieldComponent} from './components/poll-stepper-field/poll-stepper-field.component';
import {PollStepperInterface} from './interfaces/poll-stepper.interface';
import {PollStepperTextFieldComponent} from "./components/poll-stepper-text-field/poll-stepper-text-field.component";
import {TelegramService} from "../../../../core/tg/telegram.service";
import {PollTariffFieldComponent} from "./components/poll-tariff-field/poll-tariff-field.component";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

@Component({
  selector: 'app-poll-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poll-stepper.component.html',
  styleUrl: './poll-stepper.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PollStepperComponent {
  @ViewChild('stepContainer', {read: ViewContainerRef, static: true})
  private stepContainer!: ViewContainerRef;
  private completeRegFired = false;
  private destroyRef = inject(DestroyRef);
  protected stepperState = this.pollStepperService.getState();
  protected currentStepIndex = this.pollStepperService.getCurrentIndex();

  protected isCompleted = false; // ✅ прапорець завершення форми

  private cmpRef?: ComponentRef<any>;
  private lastKey?: string;

  constructor(
    private pollStepperService: PollStepperService,
    private telegramService: TelegramService,
    private route: ActivatedRoute,
  ) {
    effect(
      () => {
        const steps = this.stepperState();
        const idx = this.currentStepIndex();

        if (!steps?.length) {
          this.clearStep();
          return;
        }

        // Якщо форма завершена — не рендеримо питання
        if (this.isCompleted) {
          this.clearStep();
          return;
        }

        const safeIdx = Math.max(0, Math.min(idx, steps.length - 1));
        const field = steps[safeIdx];

        const key = field?.fieldName ?? String(safeIdx);
        if (!this.cmpRef || this.lastKey !== key) {
          this.renderStep(field);
          this.lastKey = key;
        } else if (this.cmpRef) {
          this.cmpRef.instance.field = field;
        }
      },
      {allowSignalWrites: false}
    );
  }

  goToNextStep(): void {
    const steps = this.stepperState();
    const idx = this.currentStepIndex();

    if (idx === steps.length - 1) {
      const text = this.buildSurveyResultMessage();
      this.clearStep();
      this.sendToTelegram(text)

      this.isCompleted = true; // ✅ показуємо екран подяки
      return;
    }

    this.pollStepperService.nextStep();
  }

  private sendToTelegram(message): void {
    this.telegramService.sendPollResult(message).subscribe({
      next: (result) => {
        console.log('Telegram OK', result);

        if (!this.completeRegFired) {
          window.fbq?.('track', 'CompleteRegistration');
          console.log('CompleteRegistration OK');
          this.completeRegFired = true;
        }

        this.isCompleted = true;
        const type = this.route.snapshot.queryParams['type'] ?? 'TRAINING_HOME';
        window.open(`https://t.me/buk_fit_chat_bot?start=${type}`, '_blank');

        // за бажанням: this.router.navigate(['/thank-you']);
      },
      error: (err) => {
        console.error('Telegram ERROR', err);
        // тут можна показати повідомлення і не завершувати форму
      }
    });
  }

  goToPreviousStep(): void {
    this.pollStepperService.prevStep();
  }

  private buildSurveyResultMessage(): string {
    const steps = this.stepperState();

    const header = `📝 <b>Нова заявка з опитування</b>\n📅 ${new Date().toLocaleString('uk-UA')}\n\n`;

    const body = steps
      .map((step, index) => {
        let answerText = '';
        let messanger = '';

        if (step.type === 'choice') {
          const selected = step.answers?.find(a => a.value === step.selectedAnswer);
          answerText = selected ? selected.title : '(не вибрано)';
        } else if (step.type === 'phone') {
          answerText = step.value || '(не вказано)';
          messanger = step.valueMessenger || '(не вказано)';
        } else if (step.type === 'tariff') {
          answerText = step.selectedAnswer || '(не вказано)';
        } else {
          answerText = '(немає даних)';
        }

        return `${index + 1}. <b>${step.question}</b>\n   ${answerText} \n ${messanger}`;
      })
      .join('\n\n');

    return header + body;
  }


  private renderStep(field: PollStepperInterface): void {
    this.stepContainer.clear();

    let componentType: Type<any>;
    switch (field.type) {
      case 'welcome':
        componentType = PollStepperWelcomeComponent;
        break;
      case 'phone':
        componentType = PollStepperTextFieldComponent;
        break;
      case 'tariff':
        componentType = PollTariffFieldComponent;
        break;
      case 'choice':
      default:
        componentType = PollStepperFieldComponent;
        break;
    }

    this.cmpRef = this.stepContainer.createComponent(componentType);
    this.cmpRef.instance.field = field;
  }

  private clearStep(): void {
    this.stepContainer.clear();
    this.cmpRef?.destroy();
    this.cmpRef = undefined;
    this.lastKey = undefined;
  }

  getProgressPercentage(): number {
    const totalSteps = this.stepperState().length;
    const currentIndex = this.currentStepIndex();

    if (totalSteps <= 1) return 100;

    const firstStepWeight = 40; // % після першого кліку "Далі"
    const remainingWeight = 60; // залишок %
    const remainingSteps = totalSteps - 2; // кроки між першим і останнім

    // Старт — 0%
    if (currentIndex === 0) {
      return 0;
    }

    // Перший перехід
    if (currentIndex === 1) {
      return firstStepWeight;
    }

    // Наступні кроки
    const afterFirst = currentIndex - 1; // скільки кроків пройшли після першого
    const perStep = remainingSteps > 0 ? remainingWeight / remainingSteps : remainingWeight;

    return Math.min(100, firstStepWeight + afterFirst * perStep);
  }
}
