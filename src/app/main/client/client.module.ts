import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-routing.module';
import { AccountBlockedComponent } from './pages/account-blocked/account-blocked.component';
import {HSButtonModule} from "../../core/components/button";
import {DateFirebasePipe} from "../../core/pipes/date-firebase.pipe";



@NgModule({
  declarations: [
    AccountBlockedComponent,
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
    HSButtonModule,

  ]
})
export class ClientModule { }
