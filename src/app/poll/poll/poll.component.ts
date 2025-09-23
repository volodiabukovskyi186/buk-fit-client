import { Component, effect, OnInit, ViewEncapsulation } from '@angular/core';
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

  constructor(
    private pollStepperService: PollStepperService,
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

  private setState(): void {
    const questions: PollStepperInterface[] = [
      {
        "type": "choice",
        "fieldName": "goal",
        "question": "Яка твоя головна мета, заради якої ти готовий діяти вже сьогодні? 🚀",
        "answers": [
          { "title": "🔥 Скинути вагу та відчути легкість у тілі", "value": "lose_weight" },
          { "title": "💪 Набрати м’язи та виглядати сильніше", "value": "gain_muscle" },
          { "title": "⚡ Бути в тонусі та завжди мати енергію", "value": "maintain_shape" },
          { "title": "🍏 Навчитися правильно харчуватись без дієт", "value": "improve_nutrition" },
          { "title": "🧠 Позбутися стресу й підняти настрій через спорт", "value": "mental_wellbeing" },
          { "title": "❓ Маю іншу ціль", "value": "other" }
        ]
      },
      {
        "type": "choice",
        "fieldName": "emotionalState",
        "question": "Як ти почуваєшся останнім часом? Це напряму впливає на результат 🧩",
        "answers": [
          { "title": "😩 Втома та постійна нестача енергії", "value": "low" },
          { "title": "⚖️ Нормально, але хотілося б кращого самопочуття", "value": "medium" },
          { "title": "🌈 Повний заряд — готовий(-а) підкорювати цілі!", "value": "high" },
          { "title": "🤔 Важко визначитись", "value": "uncertain" }
        ]
      },
      {
        "type": "choice",
        "fieldName": "activity",
        "question": "Наскільки ти зараз активний(-а)? Це допоможе підібрати ефективніший план ⚡",
        "answers": [
          { "title": "🛋️ Мінімальна активність (багато сиджу)", "value": "low" },
          { "title": "🚶‍♂️ Ходжу/рухаюсь, але без системних тренувань", "value": "moderate" },
          { "title": "🏋️ Регулярно тренуюсь і хочу результат швидше", "value": "high" }
        ]
      },
      {
        "type": "choice",
        "fieldName": "dietExperience",
        "question": "А як щодо дієт чи планів харчування? 😉",
        "answers": [
          { "title": "✅ Пробував(-ла) і це працювало", "value": "yes_success" },
          { "title": "😕 Пробував(-ла), але без результату", "value": "yes_fail" },
          { "title": "🙅 Ще не пробував(-ла), але готовий(-а) почати", "value": "no" }
        ]
      },
      {
        "type": "choice",
        "fieldName": "gender",
        "question": "Щоб зробити план максимально персональним — вкажи стать 👇",
        "answers": [
          { "title": "👩 Жіноча", "value": "female" },
          { "title": "👨 Чоловіча", "value": "male" },
          { "title": "😎 Не хочу вказувати", "value": "unspecified" }
        ]
      },
      {
        "type": "choice",
        "fieldName": "age",
        "question": "Твій вік допоможе нам підібрати безпечне та ефективне навантаження 📊",
        "answers": [
          { "title": "18–24", "value": "18-24" },
          { "title": "25–34", "value": "25-34" },
          { "title": "35–44", "value": "35-44" },
          { "title": "45–54", "value": "45-54" },
          { "title": "55+", "value": "55+" },
          { "title": "Не хочу вказувати", "value": "unspecified" }
        ]
      },
      {
        "type": "choice",
        "fieldName": "sleepQuality",
        "question": "Сон — ключ до відновлення. Як у тебе з цим зараз? 🌙",
        "answers": [
          { "title": "😴 Часто поганий сон, важко відновлюватись", "value": "poor" },
          { "title": "😐 Буває по-різному, стабільності нема", "value": "average" },
          { "title": "😌 Сплю добре й відчуваю відновлення", "value": "good" }
        ]
      },

      {
        type: 'phone',
        fieldName: 'phone',
        question: 'Введіть свій номер телефону, щоб отримати чек-лист 📲',
        required: true,
        value: '',
        valueMessenger: '',
      },
      // {
      //   type: "tariff",
      //   fieldName: "tariff",
      //   question: "Оберіть тариф для тренувань 👇",
      //   value: '',
      // },
    ];

    this.pollStepperService.setStepper(questions);
  }

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
