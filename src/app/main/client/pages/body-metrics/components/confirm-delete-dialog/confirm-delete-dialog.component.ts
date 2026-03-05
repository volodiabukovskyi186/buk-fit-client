import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDeleteDialogData {
  title?: string;
  message?: string;
}

@Component({
  selector: 'bk-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.scss'],
  standalone: false,
})
export class ConfirmDeleteDialogComponent {
  readonly title: string;
  readonly message: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: ConfirmDeleteDialogData,
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
  ) {
    this.title = data?.title ?? 'Видалити запис?';
    this.message = data?.message ?? 'Цю дію неможливо скасувати.';
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
