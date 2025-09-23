import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralInfoRoutingModule } from './general-info-routing.module';
import { GeneralInfoComponent } from './general-info.component';


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

import { GeneralInfoNutritionComponent } from './components/general-info-nutrition/general-info-nutrition.component';
import { GeneralInfoNutritionPlanComponent } from './components/general-info-nutrition-plan/general-info-nutrition-plan.component';
import { GeneralInfoWorkoutProgramComponent } from './components/general-info-workout-program/general-info-workout-program.component';
import { GeneralInfoDietCalculationComponent } from './components/general-info-diet-calculation/general-info-diet-calculation.component';


@NgModule({
  declarations: [
    GeneralInfoComponent,
    GeneralInfoNutritionComponent,
    GeneralInfoNutritionPlanComponent,
    GeneralInfoWorkoutProgramComponent,
    GeneralInfoDietCalculationComponent
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

    GeneralInfoRoutingModule
  ]
})
export class GeneralInfoModule { }
