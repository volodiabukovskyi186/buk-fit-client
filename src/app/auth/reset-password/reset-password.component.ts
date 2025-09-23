import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {HSButtonModule} from "../../core/components/button";
import {HSFormFieldModule} from "../../core/components/form-field";
import {HSInputModule} from "../../core/components/input";
import {RouterLink} from "@angular/router";
import {AuthService} from "../../core/services/auth/auth.service";
import {catchError, Subscription} from "rxjs";
import {AlertService, HSAlertModule} from "../../core/components/alert";

@Component({
  selector: 'bk-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HSButtonModule, HSFormFieldModule, HSInputModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  emailControl: FormControl = new FormControl('', [Validators.required, Validators.email]);
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
  ) {
  }

  ngOnInit(): void {

  }

  resetPassword(): void {
    if(!this.emailControl.valid) {
      this.emailControl.markAsTouched();
      return;
    }

    const stream$ = this.authService.resetPassword(this.emailControl.value).pipe(
      catchError((error: any) => {
        if(error) {
          this.alertService.openDefaultError('Помилка', 'Пароль не скинуто')
        }
        return error;
      }),
    ).subscribe((result) => {
      console.log('result00000', result)
      this.alertService.openDefaultSuccess('Успіх', 'Пароль буде кинуто і вам прийде E-mail для підтвердження')
    });

    this.subscription.add(stream$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

}
