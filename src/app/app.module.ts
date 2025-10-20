import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {NgModule} from '@angular/core';

import {AngularFireModule} from '@angular/fire/compat';
import {AngularFireAuthModule} from '@angular/fire/compat/auth';
import {AngularFirestoreModule} from '@angular/fire/compat/firestore';
import {AngularFireFunctionsModule} from "@angular/fire/compat/functions";


import {AngularFireStorageModule} from '@angular/fire/compat/storage';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserModule} from '@angular/platform-browser';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';

import {environment} from '../environments/environment';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HSAlertModule} from "./core/components/alert";
import {PaymentComponent} from "./main/client/pages/payment/payment.component";

@NgModule({
  declarations: [
    AppComponent,
  ],
  bootstrap: [AppComponent],
  imports: [HSAlertModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireFunctionsModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    MatSnackBarModule,
    AngularFireStorageModule,
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    NgxMaskDirective,
    PaymentComponent],
  providers: [
    provideNgxMask(),
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      },
    },
    provideHttpClient(withInterceptorsFromDi()),
  ]
})
export class AppModule {
}
