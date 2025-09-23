import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import {LiqpayService} from "../../../../core/services/payment/payament.service";
import { HttpClient } from "@angular/common/http";
import {HSButtonModule} from "../../../../core/components/button";
import {filter, Subscription} from "rxjs";
import {ClientInterface} from "../../../../core/interfaces/user.interface";
import {USER_STATUS_ENUM} from "../../../../core/enums/users-status.enum";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {collection, orderBy, where} from "@angular/fire/firestore";
import {take} from "rxjs/operators";
import {USER_PAYMENTS_TARIFF_ENUM} from "../../../../core/enums/user-payments-tariff.enum";
import {DateFirebasePipe} from "../../../../core/pipes/date-firebase.pipe";
import {UserPaymentTemplate} from "../../../../core/interfaces/user-payment-template.interface";

declare const Wayforpay: any;
@Component({
  selector: 'bk-payment',
  standalone: true,
  imports: [CommonModule, HSButtonModule, DateFirebasePipe],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PaymentComponent implements OnInit {
  protected readonly userPaymentsTariffEnum = USER_PAYMENTS_TARIFF_ENUM;
  data!: string;
  signature!: string;
  payment!: UserPaymentTemplate;
  historyPayments:UserPaymentTemplate[] = [];

  user: ClientInterface
  constructor(
    private liqpayService: LiqpayService,
    private authService: AuthService,

  ) {
  }

  private subscription: Subscription = new Subscription();
  ngOnInit(): void {
  this.getUser();
  }

  getUser(): void {
    const stream$ = this.authService.userState$.pipe(filter((user: ClientInterface | null) => user !== null), take(1)).subscribe((user: ClientInterface) => {
      this.user = user;
      console.log('USER======>', this.user)
      this.getActivePayments();
      this.getHistoryPayments();
    });

    this.subscription.add(stream$);
  }

  getActivePayments(): void {
    const stream$ = this.liqpayService.getActivePayments(this.user.id).subscribe((payment: any) => {
      this.payment = payment;
      console.log('this.payment------>', this.payment)
    });

    this.subscription.add(stream$);
  }

  getHistoryPayments(): void {
    const stream$ = this.liqpayService.getHistoryPayments(this.user.id).subscribe((historyPayments: any) => {
      this.historyPayments = historyPayments;
      console.log('this.historyPayments------>', this.historyPayments)
    });

    this.subscription.add(stream$);
  }


  async callFirebase() {

    this.liqpayService.initiatePayment(this.user.id, this.user.email).subscribe({
      next: (paymentData) => {
        console.log('11111111', paymentData)
        const wayforpay = new Wayforpay();
        wayforpay.run({
          merchantAccount: paymentData.merchantAccount,
          merchantDomainName: paymentData.merchantDomainName,
          authorizationType: 'SimpleSignature',
          merchantSignature: paymentData.merchantSignature,
          orderReference: paymentData.orderReference,
          orderDate: paymentData.orderDate,
          amount: paymentData.amount,
          currency: paymentData.currency,
          productName: paymentData.productName,
          productPrice: paymentData.productPrice,
          productCount: paymentData.productCount,
          clientEmail: paymentData.clientEmail,
          serviceUrl: paymentData.serviceUrl,
          returnUrl: 'https://us-central1-buk-panel.cloudfunctions.net/wayforpayCallback/payment-success',

          onApproved: function() {
            console.log('✅ Оплата успішна');
            window.location.href = '/client/payment';
          },
          onDeclined: function() {
            console.log('❌ Оплата не пройшла');
          },
          onPending: function() {
            console.log('⌛ Очікується оплата');
          },
        });
      },
      error: (error) => {
        console.error('Payment initiation failed:', error);
        alert('Не вдалося ініціювати оплату');
      }
    });
  }
}
