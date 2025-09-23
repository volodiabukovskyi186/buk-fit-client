import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HSButtonModule} from "../../core/components/button";
import {HSFormFieldModule} from "../../core/components/form-field";
import {HSInputModule} from "../../core/components/input";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors, ValidatorFn,
  Validators
} from "@angular/forms";
import {AdminsService} from "../../core/services/admins/admin.service";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../core/services/auth/auth.service";
import {Firestore, collection, addDoc, collectionData, doc, getDoc, setDoc} from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Timestamp } from '@angular/fire/firestore';
import {USER_ROLES_ENUM} from "../../core/enums/users-roles.enum";
import {USER_STATUS_ENUM} from "../../core/enums/users-status.enum";
import {ClientInterface} from "../../core/interfaces/user.interface";
import {TOKEN_ENUM} from "../../core/enums/token.enum";
import {catchError, of, Subscription} from "rxjs";
import {NgxMaskDirective} from "ngx-mask";
import {BKTgService} from "../../core/services/tg/tg.service";
import {environment} from "../../../environments/environment";


@Component({
  selector: 'bk-register',
  standalone: true,
  imports: [CommonModule, HSButtonModule, HSFormFieldModule, HSInputModule, ReactiveFormsModule, RouterLink, NgxMaskDirective],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  isEmailExists = false;
  chatId
  private subscription: Subscription = new Subscription();

  constructor(
    private bkTgService: BKTgService,
    private adminsService: AdminsService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ){}


  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: this.fb.control('', Validators.required),
      secondName: this.fb.control('' , Validators.required),
      phone: this.fb.control('+', Validators.required),
      email: this.fb.control('',[ Validators.required,  Validators.email]),
      password: this.fb.control('',[ Validators.required, Validators.minLength(6)]),
      confirmPassword: this.fb.control('', Validators.required)
    },
      { validators: this.passwordMatchValidator('password', 'confirmPassword') }
      )


    this.bkTgService.getUpdates().subscribe((response: any) => {
      console.log('response', response);
      // this.snackBar.open('Ви успішно надіслали повідомлення в бот про оновлення вправ', 'Закрити', {duration: 2000});
    })

  }

  passwordMatchValidator(password: string, confirmPassword: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const passwordControl = control.get(password);
      const confirmPasswordControl = control.get(confirmPassword);

      if (!passwordControl || !confirmPasswordControl) {
        return null; // Якщо контролів немає, не перевіряємо
      }

      const passwordValue = passwordControl.value;
      const confirmPasswordValue = confirmPasswordControl.value;

      if (passwordValue !== confirmPasswordValue) {
        confirmPasswordControl.setErrors({ passwordMismatch: true }); // Встановлюємо помилку
        return { passwordMismatch: true };
      } else {
        if (confirmPasswordControl.hasError('passwordMismatch')) {
          confirmPasswordControl.setErrors(null); // Видаляємо помилку, якщо паролі співпадають
        }
        return null;
      }
    };
  }

   register() {

    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const email = this.registerForm.get('email').value;
    const password = this.registerForm.get('password').value;

    const stream$ = this.authService.register(email, password).pipe(
      catchError((error: any) => {
        if (error) {
          this.isEmailExists = true;
        }

        return error;
      })
    ).subscribe((uid: any) => {
      this.login(uid);
    });

    this.subscription.add(stream$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async login(uid: string): Promise<void> {
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;

    this.authService.loginNotCheckUser(email, password).subscribe({
      next: (token: string) => {
        localStorage.setItem(TOKEN_ENUM, token);
        console.log("LOGED=====>")
        this.addUser(uid);

      },
      error: (error) => {
        console.error('Помилка входу:', error);

      }
    });
  }

  addUser(uid: string): void {
    const formValue = this.registerForm.value;
    const tg = (window as any)?.Telegram?.WebApp;

    const user: any = {
      id:  uid,
      coachId: null,
      createdAt: Timestamp.now(),
      name: formValue.name,
      secondName: formValue.secondName,
      phone: formValue.phone,
      email: formValue.email,
      role: USER_ROLES_ENUM.CLIENT,
      status: USER_STATUS_ENUM.NEW,
      tgUser: tg?.initDataUnsafe?.user || null,
    }

    of(this.firestore.collection('clients').doc(uid).set(user)).subscribe(() => {
      this.router.navigate(['/client/survey-welcome']);
      this.sendMessage(uid, user);
    })

  }

  sendMessage(userId, user): any {
    const chatId = environment.registerChatId;
    let apiUrl = `https://api.telegram.org/bot${environment.botNewRegister}/sendMessage`;

    const formData: FormData = new FormData();
    const message = `
<b>🟢Новий Користувач</b>  \n
 <b>Імя:</b> ${user.name}\n
 <b>Прізвище:</b> ${user.secondName}\n
 <b>Номер телефону:</b> ${user.phone}\n
 <b>Email:</b> ${user.email}\n
 <b>id:</b> ${user.id}\n
`;
    formData.append('text', message)
    formData.append('parse_mode', 'html');
    const reply_markup = {
      inline_keyboard : [
        [{
          text: 'Перейти до користувача',
          url:`${environment.bukAdminLink}/users/user/${userId}`,
        }]
      ]
    }

    formData.append('reply_markup', JSON.stringify(reply_markup));

    formData.append('chat_id', (chatId as any));


    this.bkTgService.sendMessage(apiUrl, formData).subscribe((response: any) => {
      console.log('response', response);
      // this.snackBar.open('Ви успішно надіслали повідомлення в бот про оновлення вправ', 'Закрити', {duration: 2000});
    })


  }
}
