import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgramRoutingModule } from './calculate-calories-routing.module';

import { TableGridModule } from 'src/app/core/components/table-grid';
import { HSButtonModule } from 'src/app/core/components/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { HSTimeToUtcModule } from 'src/app/core/pipes/utc-to-local/utc-to-local.module';
import { HSInputModule } from 'src/app/core/components/input';
import { HSFormFieldModule } from 'src/app/core/components/form-field';
import { MatDialogModule } from "@angular/material/dialog";
import { ButtonToggleModule } from 'src/app/core/components/button-toggle/button-toggle.module';
import { HSSelectModule } from 'src/app/core/components/select/select.module';
import { ProgramComponent } from './calculate-calories.component';


@NgModule({
  declarations: [
    ProgramComponent
  ],
  imports: [
    HSSelectModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonToggleModule,
    MatDialogModule,
    HSInputModule,
    HSFormFieldModule,
    HSTimeToUtcModule,
    ClipboardModule,
    ReactiveFormsModule,
    FormsModule,
    HSButtonModule,
    TableGridModule,
    CommonModule,

    ProgramRoutingModule
  ]
})
export class CalculateCaloriesModule { }
