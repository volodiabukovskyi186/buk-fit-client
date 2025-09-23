import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {catchError, filter, from, Observable, Subscription, switchMap} from 'rxjs';
import { AdminsService } from 'src/app/core/services/admins/admin.service';
import {AuthService} from "../../core/services/auth/auth.service";
import {User} from "firebase/auth";
import {TOKEN_ENUM} from "../../core/enums/token.enum";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'bk-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isErrorAuth = false;
  subscription: Subscription = new Subscription();
  constructor(
    private adminsService: AdminsService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ){}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.checkIsLoggedIn();
    this.loginForm = this.fb.group({
      email: this.fb.control('', Validators.required),
      password: this.fb.control('', Validators.required)
    })

    const admin = localStorage.getItem('admin');

    if(admin) {
      this.loginForm.patchValue(JSON.parse(admin));
      this.login();
    }
  }

  checkIsLoggedIn(){
    // const stream$ = this.authService.userFirebase$.pipe(filter((user: User) => user !== null)).subscribe((user: User) => {
    //   this.router.navigate(['/client/program']);
    // });
    // this.subscription.add(stream$);
  }

  login() {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const password = this.loginForm.get('password')?.value;
    const email = this.loginForm.get('email')?.value;

    // const stream$ = this.authService.login(email, password).subscribe({
    //   next: (token: string) => {
    //     console.log('Отримано токен:', token);
    //     localStorage.setItem(TOKEN_ENUM, token); // Зберігаємо токен
    //     this.router.navigate(['/client/program']);
    //   },
    //   error: (error) => {
    //     this.loginForm.controls['password'].setErrors({ incorrect: true });
    //     console.error('Помилка входу:', error);
    //   }
    // });
    //
    // this.subscription.add(stream$);

    const stream$ = this.authService.login(email, password).pipe(
      catchError((error: any) => {
        this.snackBar.open(error)
        return error
      })
    ).subscribe((token: string) => {

      console.log('Отримано токен:', token);
      localStorage.setItem(TOKEN_ENUM, token);
      this.router.navigate(['/client/program']);
    });


    this.subscription.add(stream$);

  }
}
