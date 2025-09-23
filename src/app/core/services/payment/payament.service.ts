import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { HttpClient } from "@angular/common/http";
import {map, Observable} from "rxjs";
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Injectable({ providedIn: 'root' })
export class LiqpayService {
  private functionUrl = 'https://us-central1-buk-panel-sbx.cloudfunctions.net/testFunction';

  constructor(
    private http: HttpClient,
    private fns: AngularFireFunctions,
    private firestore: AngularFirestore
  ) {}

  initiatePayment(userId: string, email:string): Observable<any> {
    const callable = this.fns.httpsCallable('generatePayment');
    return callable({ userId, email:email});
  }

  getActivePayments(userId): Observable<any> {

    return this.firestore.collection('users-payments', ref =>
      ref.where('userId', '==', userId).where('status', '==', 'ACTIVE'))
      .snapshotChanges().pipe(
        map((changes: any) => {

          const payment = changes.map((change: any) => {
            const data = change.payload.doc.data();
            const id = change.payload.doc.id;
            return { id, ...data };
          });

          return payment[0];
        })
      )

  }

  getHistoryPayments(userId): Observable<any> {

    return this.firestore.collection('users-payments', ref =>
      ref.where('userId', '==', userId).where('status', '==', 'PAYED'))
      .snapshotChanges().pipe(
        map((changes: any) => {

          const payments = changes.map((change: any) => {
            const data = change.payload.doc.data();
            const id = change.payload.doc.id;
            return { id, ...data };
          });

          return payments;
        })
      )

  }

}
