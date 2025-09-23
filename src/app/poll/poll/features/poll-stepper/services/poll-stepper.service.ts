import { Injectable, Signal, signal, computed } from '@angular/core';
import { PollStepperInterface } from '../interfaces/poll-stepper.interface';

@Injectable()
export class PollStepperService {
  private stepperState = signal<PollStepperInterface[]>([]);
  private currentIndex = signal<number>(0);

  // Опціонально: прогрес у % (зручно для прогресбару)
  readonly progressPct = computed(() => {
    const total = this.stepperState().length || 1;
    return Math.round(((this.currentIndex() + 1) / total) * 100);
  });

  constructor() {}

  /** Signals getters */
  getState(): Signal<PollStepperInterface[]> { return this.stepperState; }
  getCurrentIndex(): Signal<number> { return this.currentIndex; }

  /** Ініціалізація/заміна списку кроків */
  setStepper(stepper: PollStepperInterface[]): void {
    this.stepperState.set(stepper ?? []);
    this.currentIndex.set(0);
  }

  /** Безпечні переходи між кроками */
  nextStep(): void {
    const i = this.currentIndex();
    const last = this.stepperState().length - 1;
    if (i < last) this.currentIndex.set(i + 1);
  }

  prevStep(): void {
    const i = this.currentIndex();
    if (i > 0) this.currentIndex.set(i - 1);
  }

  goTo(index: number): void {
    const last = this.stepperState().length - 1;
    const clamped = Math.max(0, Math.min(index, last));
    this.currentIndex.set(clamped);
  }

  updateStepperField(fieldName: string, patch: Partial<PollStepperInterface>): void {
    this.stepperState.update(list =>
      list.map(item => item.fieldName === fieldName ? { ...item, ...patch } : item)
    );
  }

  updateValue(fieldName: string, value: string, valueMessenger): void {
    console.log(valueMessenger)
    this.stepperState.update(list =>
      list.map(item => item.fieldName === fieldName ? { ...item, value, valueMessenger } : item)
    );
  }

  selectAnswer(fieldName: string, answerValue: string, autoNext = true): void {
    this.stepperState.update(list =>
      list.map(item =>
        item.fieldName === fieldName ? { ...item, selectedAnswer: answerValue } : item
      )
    );
  }


}
