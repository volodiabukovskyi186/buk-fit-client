import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';

import {CommonModule} from "@angular/common";
import {ClientInterface} from "../../../../core/interfaces/user.interface";
import {USER_STATUS_ENUM} from "../../../../core/enums/users-status.enum";
import {filter, Subscription} from "rxjs";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {HSFormFieldModule} from "../../../../core/components/form-field";
import {HSInputModule} from "../../../../core/components/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Timestamp} from "@angular/fire/firestore";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {HSButtonModule} from "../../../../core/components/button";
import {UserSurveyComponent} from "./features/user-survey/user-survey.component";

@Component({
  selector: 'hs-user-profile',
  imports: [CommonModule, HSFormFieldModule, HSInputModule, ReactiveFormsModule, HSButtonModule, UserSurveyComponent],
  standalone: true,
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserProfileComponent implements OnInit, OnDestroy {
  user: ClientInterface
  userStatusEnum = USER_STATUS_ENUM;
  private subscription: Subscription = new Subscription();
  formGroup: FormGroup;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private firestore: AngularFirestore,
    private router: Router,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.getUserState();
  }

  async updateUser(): Promise<void> {
    const payload = {
      ...this.formGroup.getRawValue(),
      updatedAt: Timestamp.now(), // Use compat version of Timestamp
    };

    if (!this.formGroup.valid) {
      this.snackBar.open('Форма не валідна, виправіть помилки', 'Закрити', { duration: 3000 });
      this.formGroup.markAsTouched();
      return;
    }

    const userDocRef = this.firestore.collection('clients').doc(this.user.id);

    try {
      await userDocRef.update(payload);
      this.snackBar.open('Дані успішно оновлено', 'Закрити', { duration: 2000 });
    } catch (error) {
      console.error('❌ Помилка оновлення:', error);
    }
  }



  private initForm(): void {
    this.formGroup = this.fb.group({
      name: this.fb.control(null, Validators.required),
      secondName: this.fb.control(null, Validators.required),
      status: this.fb.control(null, Validators.required),
      role: this.fb.control(null, Validators.required),
      phone: this.fb.control(null, Validators.required),
      email: this.fb.control(null, Validators.required),
      createdAt: this.fb.control(null, Validators.required),
      updatedAt: this.fb.control(null),
      coachId: this.fb.control(null),
      id: this.fb.control(null, Validators.required),
      weight: this.fb.control(null),
      calories: this.fb.control(null),
      proteins: this.fb.control(null),
      fats: this.fb.control(null),
      carbohydrates: this.fb.control(null),
    });

    this.formGroup.get('email').disable();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getUserState() {
    const stream$ = this.authService.userState$.pipe(filter((user: ClientInterface | null) => user !== null)).subscribe((user: ClientInterface) => {
      this.user = user;
      this.formGroup.patchValue(this.user);
    });

    this.subscription.add(stream$);
  }
}
