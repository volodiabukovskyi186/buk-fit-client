import {
  Directive,
  DoCheck,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Self,
} from '@angular/core';
import {
  AbstractControl,
  FormGroupDirective,
  NgControl,
  NgForm,
  Validators,
} from '@angular/forms';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { getSupportedInputTypes } from '@angular/cdk/platform';
import { ErrorStateMatcher } from '@angular/material/core';

import { Subject } from 'rxjs';
import {HSFormFieldComponent} from "src/app/core/components/form-field";
import {HS_FORM_FIELD} from "src/app/core/components/form-field";

import { HSFormFieldControl } from '../form-field/form-field-control';
import { HS_INPUT_VALUE_ACCESSOR } from './input-value-accessor';
import { getHSInputUnsupportedTypeError } from './input-errors';



// ---------------------------------------------
// INVALID TYPES
// ---------------------------------------------
const HS_INPUT_INVALID_TYPES = [
  'button',
  'checkbox',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
];

let nextUniqueId = 0;

// ---------------------------------------------
// LOCAL DEFAULT ERROR STATE MATCHER
// (аналог DefaultErrorStateMatcher)
// ---------------------------------------------
export class HSDefaultErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: AbstractControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const isSubmitted = !!(form && form.submitted);
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Directive({
  selector: `
    input[iqInput], textarea[iqInput],
    select[iqNativeControl], input[iqNativeControl], textarea[iqNativeControl]
  `,
  exportAs: 'iqInput',
  host: {
    'class': 'hs-input-element hs-form-field-autofill-control',
    '[class.hs-mdc-native-select-inline]': '_isInlineSelect()',

    '[id]': 'id',
    '[disabled]': 'disabled',
    '[required]': 'required',
    '[attr.name]': 'name || null',
    '[attr.readonly]': 'readonly && !_isNativeSelect || null',

    '[attr.aria-invalid]': '(empty && required) ? null : errorState',
    '[attr.aria-required]': 'required',

    '(focus)': '_focusChanged(true)',
    '(blur)': '_focusChanged(false)',
    '(input)': '_onInput()',
  },
  providers: [
    { provide: HSFormFieldControl, useExisting: HSInputDirective },
    { provide: ErrorStateMatcher, useClass: HSDefaultErrorStateMatcher },
  ],
})
export class HSInputDirective
  implements HSFormFieldControl<any>, OnDestroy, DoCheck {

  // ---------------------------------------------
  // PROPERTIES
  // ---------------------------------------------
  protected _uid = `hs-input-${nextUniqueId++}`;
  protected _previousNativeValue: any;

  private _inputValueAccessor: { value: any };
  private _previousPlaceholder!: string | null;

  readonly _isNativeSelect: boolean;
  readonly _isTextarea: boolean;
  readonly _isInFormField: boolean;

  focused = false;
  readOnly = false;

  readonly stateChanges = new Subject<void>();

  controlType = 'hs-input';
  autofilled = false;

  protected _disabled = false;
  protected _id!: string;

  protected _required: boolean | undefined;
  protected _readonly = false;

  protected _neverEmptyInputTypes = [
    'date',
    'datetime',
    'datetime-local',
    'month',
    'time',
    'week',
  ].filter(t => getSupportedInputTypes().has(t));

  protected _type = 'text';

  // error state stuff
  errorState = false;
  protected _defaultErrorStateMatcher: ErrorStateMatcher;
  protected _parentForm: NgForm | null;
  protected _parentFormGroup: FormGroupDirective | null;

  // ---------------------------------------------
  // INPUTS
  // ---------------------------------------------
  @Input()
  get disabled(): boolean {
    return this.ngControl?.disabled ?? this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    if (this.focused) {
      this.focused = false;
      this.stateChanges.next();
    }
  }

  @Input()
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value || this._uid;
  }

  @Input() placeholder!: string;
  @Input() name!: string;

  @Input()
  get required(): boolean {
    return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
  }

  @Input()
  get type(): string {
    return this._type;
  }
  set type(value: string) {
    this._type = value || 'text';
    this._validateType();
    if (!this._isTextarea && getSupportedInputTypes().has(this._type)) {
      (this._elementRef.nativeElement as HTMLInputElement).type = this._type;
    }
  }

  @Input() errorStateMatcher!: ErrorStateMatcher;

  @Input()
  get value(): string {
    return this._inputValueAccessor.value;
  }
  set value(value: any) {
    if (value !== this.value) {
      this._inputValueAccessor.value = value;
      this.stateChanges.next();
    }
  }

  @Input()
  get readonly(): boolean {
    return this._readonly;
  }
  set readonly(value: BooleanInput) {
    this._readonly = coerceBooleanProperty(value);
    this.readOnly = this._readonly;
  }

  // ---------------------------------------------
  // CONSTRUCTOR
  // ---------------------------------------------
  constructor(
    protected _elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() parentForm: NgForm,
    @Optional() parentFormGroup: FormGroupDirective,
    @Optional() @Self() @Inject(HS_INPUT_VALUE_ACCESSOR) inputValueAccessor: any,
    @Optional() @Inject(HS_FORM_FIELD) protected _formField: HSFormFieldComponent | null,
    @Inject(ErrorStateMatcher) defaultErrorStateMatcher: ErrorStateMatcher,
  ) {
    this._parentForm = parentForm ?? null;
    this._parentFormGroup = parentFormGroup ?? null;
    this._defaultErrorStateMatcher = defaultErrorStateMatcher;

    const element: any = this._elementRef.nativeElement;
    const nodeName = element.nodeName.toLowerCase();

    this._inputValueAccessor = inputValueAccessor || element;
    this._previousNativeValue = this.value;

    // set default id
    this.id = this.id;

    this._isNativeSelect = nodeName === 'select';
    this._isTextarea = nodeName === 'textarea';
    this._isInFormField = !!_formField;

    if (this._isNativeSelect) {
      this.controlType = element.multiple ? 'hs-native-select-multiple' : 'hs-native-select';
    }
  }

  // ---------------------------------------------
  // LIFECYCLE
  // ---------------------------------------------
  ngOnDestroy(): void {
    this.stateChanges.complete();
  }

  ngDoCheck(): void {
    this.updateErrorState();
    this._dirtyCheckNativeValue();
    this._dirtyCheckPlaceholder();
  }

  // ---------------------------------------------
  // ERROR STATE HANDLING
  // ---------------------------------------------
  updateErrorState(): void {
    const parent = this._parentFormGroup || this._parentForm;
    const matcher = this.errorStateMatcher || this._defaultErrorStateMatcher;

    const control = this.ngControl ? this.ngControl.control : null;
    const newState = !!(control && matcher.isErrorState(control, parent));

    if (newState !== this.errorState) {
      this.errorState = newState;
      this.stateChanges.next();
    }
  }

  // ---------------------------------------------
  // UI + DOM LOGIC
  // ---------------------------------------------
  focus(options?: FocusOptions): void {
    this._elementRef.nativeElement.focus(options);
  }

  _focusChanged(isFocused: boolean): void {
    if (isFocused !== this.focused) {
      this.focused = isFocused;
      this.stateChanges.next();
    }
  }

  _onInput(): void {
    // місце для кастомної логіки input
  }

  protected _dirtyCheckNativeValue(): void {
    const newValue = this._elementRef.nativeElement.value;

    if (this._previousNativeValue !== newValue) {
      this._previousNativeValue = newValue;
      this.stateChanges.next();
    }
  }

  private _dirtyCheckPlaceholder(): void {
    const placeholder = this._getPlaceholder();
    if (placeholder !== this._previousPlaceholder) {
      const element = this._elementRef.nativeElement;
      this._previousPlaceholder = placeholder;

      placeholder
        ? element.setAttribute('placeholder', placeholder)
        : element.removeAttribute('placeholder');
    }
  }

  protected _getPlaceholder(): string | null {
    return this.placeholder || null;
  }

  protected _validateType(): void {
    if (HS_INPUT_INVALID_TYPES.includes(this._type)) {
      throw getHSInputUnsupportedTypeError(this._type);
    }
  }

  protected _isNeverEmpty(): boolean {
    return this._neverEmptyInputTypes.includes(this._type);
  }

  protected _isBadInput(): boolean {
    const validity = (this._elementRef.nativeElement as HTMLInputElement).validity;
    return validity && validity.badInput;
  }

  get empty(): boolean {
    return (
      !this._isNeverEmpty() &&
      !this._elementRef.nativeElement.value &&
      !this._isBadInput() &&
      !this.autofilled
    );
  }

  onContainerClick(): void {
    if (!this.focused) {
      this.focus();
    }
  }

  _isInlineSelect(): boolean {
    const element = this._elementRef.nativeElement as HTMLSelectElement;
    return this._isNativeSelect && (element.multiple || element.size > 1);
  }
}
