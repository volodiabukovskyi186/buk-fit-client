import {Injectable} from '@angular/core';

export enum GUIDE_TYPE_ENUM {
  THREE_DAYS = 'THREE_DAYS',
  SEVEN_MISTAKES = 'SEVEN_MISTAKES',
  TRAINING_HOME = 'TRAINING_HOME',
}

@Injectable({
  providedIn: 'root'
})
export class GuideService {

  constructor() {
  }

  getGuideByType(type: GUIDE_TYPE_ENUM): any[] {
    console.log('type0000', type)
    switch (type) {
      case GUIDE_TYPE_ENUM.THREE_DAYS:
        return this.getThreeDays();
      case GUIDE_TYPE_ENUM.SEVEN_MISTAKES:
        return this.getSevenMistakes();
      case GUIDE_TYPE_ENUM.TRAINING_HOME:
        return this.getHomeWorkout();
      default:
        return this.getThreeDays();
    }

  }

  private getThreeDays(): any[] {
    return [
      {
        "type": "choice",
        "fieldName": "goal",
        "question": "Яка ваша головна ціль зараз?",
        "answers": [
          {"title": "Схуднути", "value": "lose_weight"},
          {"title": "Підтягнути тіло", "value": "gain_muscle"},
          {"title": "Повернути форму після перерви", "value": "maintain_shape"},
        ]
      },
      {
        "type": "choice",
        "fieldName": "train_place",
        "question": "Де ви плануєте тренуватись?",
        "answers": [
          {"title": "Вдома", "value": "home"},
          {"title": "У залі", "value": "gym"},
          {"title": "На вулиці", "value": "on_out"},
        ]
      },
      {
        "type": "choice",
        "fieldName": "train_place",
        "question": "Скільки часу готові приділяти тренуванням щодня?",
        "answers": [
          {"title": "15–20 хвилин", "value": "ten_twenty"},
          {"title": "30–40 хвилин", "value": "thirty_forty"},
          {"title": "Більше години", "value": "more_hour"},
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
    ];
  }

  private getSevenMistakes(): any[] {
    return [
      {
        type: "choice",
        fieldName: "duration",
        question: "Як давно ви намагаєтесь схуднути?",
        answers: [
          {title: "До місяця", value: "under_month"},
          {title: "1–3 місяці", value: "one_three_months"},
          {title: "Понад 3 місяці", value: "over_three_months"},
        ],
      },
      {
        type: "choice",
        fieldName: "difficulty",
        question: "Що вам найскладніше дається?",
        answers: [
          {title: "Харчування", value: "nutrition"},
          {title: "Мотивація", value: "motivation"},
          {title: "Регулярність тренувань", value: "regularity"},
        ],
      },
      {
        type: "choice",
        fieldName: "experience",
        question: "Пробували дієти або марафони раніше?",
        answers: [
          {title: "Так, але без результату", value: "no_result"},
          {title: "Так, частково спрацювало", value: "partly_worked"},
          {title: "Ні, ще не пробувала", value: "not_yet"},
        ],
      },
      {
        type: 'phone',
        fieldName: 'phone',
        question: 'Введіть свій номер телефону, щоб отримати чек-лист 📲',
        required: true,
        value: '',
        valueMessenger: '',
      },

    ];
  }

  private getHomeWorkout(): any[] {
    return [

      {
        type: "choice",
        fieldName: "reason",
        question: "Чому хочете тренуватись саме вдома?",
        answers: [
          {title: "Немає часу ходити в зал", value: "no_time"},
          {title: "Так зручніше", value: "more_comfortable"},
          {title: "Не люблю публічність", value: "no_public"},
        ],
      },
      {
        type: "choice",
        fieldName: "level",
        question: "Який у вас рівень підготовки?",
        answers: [
          {title: "Початківець", value: "beginner"},
          {title: "Тренуюсь час від часу", value: "sometimes"},
          {title: "Регулярно займаюсь", value: "regular"},
        ],
      },
      {
        type: "choice",
        fieldName: "equipment",
        question: "Яке обладнання маєте вдома?",
        answers: [
          {title: "Нічого, хочу без інвентарю", value: "no_equipment"},
          {title: "Є килимок або резинки", value: "mat_or_bands"},
          {title: "Є гантелі чи інше знаряддя", value: "weights_or_tools"},
        ],
      },
      {
        type: 'phone',
        fieldName: 'phone',
        question: 'Введіть свій номер телефону, щоб отримати чек-лист 📲',
        required: true,
        value: '',
        valueMessenger: '',
      },
    ];
  }

}
