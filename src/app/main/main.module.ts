import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { MenuListComponent } from './festures/menu-list/menu-list.component';
import { HSExpansionModule } from '../core/components/expansion/expansion.module';
import { UserCreateMessageModule } from './festures/dialogs/user-create-message/user-create-message.module';
import {MatSidenavModule} from "@angular/material/sidenav";
import {PaymentComponent} from "./client/pages/payment/payment.component";


@NgModule({
  declarations: [
    MenuListComponent,
    MainComponent,
  ],
    imports: [
        UserCreateMessageModule,
        HSExpansionModule,
        CommonModule,
        MainRoutingModule,
        MatSidenavModule,
        PaymentComponent
    ]
})
export class MainModule { }
