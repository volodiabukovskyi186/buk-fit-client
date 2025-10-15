import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PollStepperWelcomeComponent} from "src/app/poll/poll/poll-stepper-welcome/poll-stepper-welcome.component";

import { PollRoutingModule } from './poll-routing.module';
import {PollComponent} from "./poll/poll.component";
import {PollStepperComponent} from "./poll/features/poll-stepper/poll-stepper.component";


@NgModule({
  declarations: [
    PollComponent,
  ],
  imports: [
    CommonModule,
    PollRoutingModule,
    PollStepperComponent,
    PollStepperWelcomeComponent
  ]
})
export class PollModule { }
