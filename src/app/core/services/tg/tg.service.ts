import { Injectable } from '@angular/core';
import {catchError, Observable, of} from "rxjs";
import { HttpClient } from "@angular/common/http";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class BKTgService {

  constructor(
    private http: HttpClient,
  ) { }


  sendMessage(apiUrl: string, formData: FormData): Observable<any> {

    return this.http.post(apiUrl, formData).pipe(
      catchError((err) => {
        console.log('ERROR=====>', err);

        return of({ error: err })
      })
    )
  }

  getUpdates(): Observable<any> {

    return this.http.get(`https://api.telegram.org/bot${environment.botNewRegister}/getUpdates`).pipe(
      catchError((err) => {
        console.log('ERROR=====>', err);

        return of({ error: err })
      })
    )
  }

}
