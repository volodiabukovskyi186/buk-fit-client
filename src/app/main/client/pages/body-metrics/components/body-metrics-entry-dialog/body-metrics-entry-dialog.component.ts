import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Timestamp } from 'firebase/firestore';
import { EntryDialogData, EntryDialogResult } from '../../models/body-metrics.models';

function positiveNumber(control: AbstractControl): ValidationErrors | null {
  const v = control.value;
  return v != null && v > 0 ? null : { positiveNumber: true };
}

@Component({
  selector: 'bk-body-metrics-entry-dialog',
  templateUrl: './body-metrics-entry-dialog.component.html',
  styleUrls: ['./body-metrics-entry-dialog.component.scss'],
  standalone: false,
})
export class BodyMetricsEntryDialogComponent implements OnInit {

  readonly isEdit: boolean;
  form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EntryDialogData,
    public dialogRef: MatDialogRef<BodyMetricsEntryDialogComponent>,
    private fb: FormBuilder,
  ) {
    this.isEdit = data.mode === 'edit';
  }

  ngOnInit(): void {
    const e = this.data.entry;

    this.form = this.fb.group({
      weightKg: [
        e?.weightKg ?? this.data.defaultWeightKg ?? null,
        [Validators.required, positiveNumber, Validators.max(500)],
      ],
      waistCm:  [e?.waistCm  ?? this.data.defaultWaistCm  ?? null, [positiveNumber, Validators.max(300)]],
      hipsCm:   [e?.hipsCm   ?? this.data.defaultHipsCm   ?? null, [positiveNumber, Validators.max(300)]],
      chestCm:  [e?.chestCm  ?? this.data.defaultChestCm  ?? null, [positiveNumber, Validators.max(300)]],
      note:     [e?.note ?? ''],
    });
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const createdAt = this.isEdit ? this.data.entry!.createdAt : Timestamp.now();

    const result: EntryDialogResult = {
      payload: {
        weightKg: +raw.weightKg,
        createdAt,
        ...(raw.waistCm  && { waistCm:  +raw.waistCm }),
        ...(raw.hipsCm   && { hipsCm:   +raw.hipsCm }),
        ...(raw.chestCm  && { chestCm:  +raw.chestCm }),
        ...(raw.note?.trim() && { note: raw.note.trim() }),
      },
    };

    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  get f() { return this.form.controls; }

  hasError(field: string, error: string): boolean {
    const c = this.form.get(field);
    return !!(c?.touched && c.hasError(error));
  }
}
