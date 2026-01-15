// select-base.mixin.ts
import { ElementRef } from '@angular/core';
import { FormControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Subject } from 'rxjs';

/**
 * Сучасний варіант базового класу без material mixin-ів.
 * Дає:
 * - stateChanges
 * - disabled
 * - tabIndex
 * - errorState
 * - updateErrorState()
 */
export abstract class HSSelectBaseMixin {
  /** Емітиться, коли щось змінилося і form-field має оновитися */
  readonly stateChanges = new Subject<void>();

  /** disabled стан контролу */
  private _disabled = false;
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    const newVal = !!value;
    if (newVal !== this._disabled) {
      this._disabled = newVal;
      this.stateChanges.next();
    }
  }

  /** tabIndex для host/контролу */
  tabIndex = 0;

  /** Чи є зараз помилки */
  errorState = false;

  constructor(
    public _elementRef: ElementRef<HTMLElement>,
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm | null,
    public _parentFormGroup: FormGroupDirective | null,
    public ngControl: NgControl | null,
  ) {}

  protected _getControl(): FormControl | null {
    return (this.ngControl?.control as FormControl | null) ?? null;
  }

  protected _getParent(): NgForm | FormGroupDirective | null {
    return this._parentFormGroup || this._parentForm || null;
  }

  /**
   * Оновлює errorState за допомогою ErrorStateMatcher.
   * API збережений, щоб код, який викликає updateErrorState(), не ламався.
   */
  updateErrorState(): void {
    const oldState = this.errorState;
    const control = this._getControl();
    const parent = this._getParent();

    const matcher = this._defaultErrorStateMatcher;
    const newState = matcher
      ? matcher.isErrorState(control, parent)
      : !!(control && control.invalid && (control.touched || control.dirty));

    if (newState !== oldState) {
      this.errorState = newState;
      this.stateChanges.next();
    }
  }
}
