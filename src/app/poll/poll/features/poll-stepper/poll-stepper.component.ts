import {AfterViewInit} from "@angular/core";
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
import {switchMap} from "rxjs";
import {Observable} from "rxjs";
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
    imports: [CommonModule],
    templateUrl: './poll-stepper.component.html',
    styleUrl: './poll-stepper.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class PollStepperComponent implements   AfterViewInit {
  @ViewChild('stepContainer', {read: ViewContainerRef, static: true})
  private stepContainer!: ViewContainerRef;
  private completeRegFired = false;
  private destroyRef = inject(DestroyRef);

  protected stepperState = null;
  protected currentStepIndex = null;
  protected isFinish = null;
  protected isCompleted = false; // ✅ прапорець завершення форми

  private cmpRef?: ComponentRef<any>;
  private lastKey?: string;

  constructor(
    private pollStepperService: PollStepperService,
    private telegramService: TelegramService,
    private route: ActivatedRoute,
  ) {

    this.stepperState = this.pollStepperService.getState();
    this.currentStepIndex = this.pollStepperService.getCurrentIndex();
    this.isFinish = this.pollStepperService.getIsFinish();

    effect(
      () => {
        const steps = this.stepperState();
        const idx = this.currentStepIndex();
        const isFinish = this.isFinish();

        if (!steps?.length) {
          this.clearStep();
          return;
        }

        // Якщо форма завершена — не рендеримо питання
        if (this.isCompleted) {
          this.clearStep();
          return;
        }

        if (isFinish) {
          const text = this.buildSurveyResultMessage();
          // this.clearStep();
          this.sendToTelegram(text)

          // this.isCompleted = true;
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

  private sendToTelegram(message: string): void {
    const type = this.route.snapshot.queryParams['type'] ?? 'TRAINING_HOME';
    const telegramUrl = `https://t.me/buk_fit_chat_bot?start=ZGw6Mjk1NTA3`;

    let link = document.querySelector(`a.ss-btn[href="${telegramUrl}"]`) as HTMLAnchorElement;
    if (!link) {
      link = document.createElement('a');
      link.href = telegramUrl;
      link.classList.add('ss-btn');
      link.style.display = 'none';
      document.body.appendChild(link);
    }

    const phone:PollStepperInterface =  this.stepperState().find(a => a.type === 'phone');

    const ssContext = {
      variables: {
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        utm_content: new URLSearchParams(window.location.search).get('utm_content'),
        startParameter: new URLSearchParams(window.location.search).get('type'),
        phoneParameter: phone.value,
      },
    };


    this.isCompleted = true;
    this.clearStep();

    const typeQueryValue = this.route?.snapshot?.queryParams['type'];

    const isDisabledMessageSound =  typeQueryValue != 'INDIVIDUAL_PLAN';

    this.telegramService.sendPollResult(message, isDisabledMessageSound).pipe(switchMap((result)=> {
      console.log('Telegram OK', result);
      return this.trackCompleteRegistration()
    } )).subscribe({
      next: () => {

        const ssDeepLinkFn = (window as any).ssDeepLink;
        if (ssDeepLinkFn) {
          ssDeepLinkFn('ss-btn', 'bukfit', false, ssContext);

          setTimeout(() => {
            link.click();
          }, 500);
        } else {
          console.warn('⚠️ SmartSender не завантажений — відкриваємо напряму');
          window.open(telegramUrl, '_blank');
        }
      },
      error: (err) => {

      }
    });

  }

  trackCompleteRegistration(): Observable<void> {
    return new Observable<void>((observer) => {
      try {
        window.fbq?.('track', 'CompleteRegistration');
        console.log('CompleteRegistration OK');
        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(error);
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
      .join('\n');

    // Усі queryParams з роуту
    const queryParams = this.route?.snapshot?.queryParams ?? {};

    // Витягуємо type окремо, решту лишаємо в об'єкті
    const { type: typeQueryValue, ...otherQueryParams } = queryParams;

    const type = `\n\nТип форми: ${typeQueryValue ? typeQueryValue : '(не вказано)'}`;
    const important = `‼️‼️‼️\n`;

    // Форматуємо решту query params (якщо є)
    const queryParamsBlock =
      Object.keys(otherQueryParams).length > 0
        ? '\n\n<b>Query params:</b>\n' +
        Object.entries(otherQueryParams)
          .map(([key, value]) => `• <b>${key}</b>: ${value ?? '(порожньо)'}`)
          .join('\n')
        : '';

    return (typeQueryValue === 'INDIVIDUAL_PLAN' ? important : '') + header + body + type + queryParamsBlock;
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



  ngAfterViewInit(): void {
    // 1️⃣ Підключаємо зовнішній скрипт SmartSender (якщо ще не підключений)
    const existing = document.querySelector('script[src="https://customer.smartsender.eu/js/client/dl.js"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://customer.smartsender.eu/js/client/dl.js';
      script.async = true;
      document.body.appendChild(script);

      // коли скрипт завантажиться — виконаємо ініціалізацію
      script.onload = () => this.initSmartSender();
    } else {
      this.initSmartSender();
    }
  }

  private initSmartSender(): void {
    // 2️⃣ Знаходимо посилання
    const links = document.querySelectorAll('a');
    if (links) {
      for (const link of Array.from(links)) {
        if (
          link.href.includes('tg://resolve') ||
          link.href.includes('https://t.me/') ||
          link.href.includes('https://direct.smartsender.com/redirect') ||
          link.href.includes('viber://pa') ||
          link.href.includes('https://vk.com/app') ||
          link.href.includes('vk://vk.com/app') ||
          link.href.includes('https://m.me') ||
          link.href.includes('https://wa.me') ||
          link.href.includes('whatsapp://send')
        ) {
          link.classList.add('ss-btn');
        }
      }
    }

    // 3️⃣ Отримуємо параметри з URL
    const getUrlParam = (param: string): string | null => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    };

    const ssContext = {
      variables: {
        utm_source: getUrlParam('utm_source'),
        utm_medium: getUrlParam('utm_medium'),
        utm_campaign: getUrlParam('utm_campaign'),
        utm_content: getUrlParam('utm_content'),
        W_chanel: getUrlParam('W_chanel'),
      },
    };

    console.log('SmartSender context:', ssContext);

    // 4️⃣ Викликаємо ssDeepLink (переконуємось, що функція вже є в window)
    const ssDeepLinkFn = (window as any).ssDeepLink;
    if (ssDeepLinkFn) {
      ssDeepLinkFn('ss-btn', 'bukfit', false, ssContext);
      console.log('✅ SmartSender DeepLink initialized');
    } else {
      console.warn('⚠️ SmartSender script not loaded yet');
    }
  }



}
