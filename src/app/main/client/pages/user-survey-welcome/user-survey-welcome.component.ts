import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {HSFormFieldModule} from "../../../../core/components/form-field";
import {HSInputModule} from "../../../../core/components/input";
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {IQCheckboxModule} from "../../../../core/components/checkbox";
import {HSSelectModule} from "../../../../core/components/select/select.module";
import {GENDER_ENUM} from "../../../../core/enums/gender.enum";
import {NgClass, NgIf} from "@angular/common";
import {filter, map, Subscription} from "rxjs";
import {HSButtonModule} from "../../../../core/components/button";
import {Firestore} from "@angular/fire/firestore";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {MatSnackBar} from "@angular/material/snack-bar";
// import {ClientInterface} from "../core/interfaces/user.interface";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {take} from "rxjs/operators";
import {ClientInterface} from "../../../../core/interfaces/user.interface";
import {USER_STATUS_ENUM} from "../../../../core/enums/users-status.enum";
import {Router} from "@angular/router";
import {TRAINING_TYPE_ENUM} from "../../../../core/enums/training-type.enum";
import {TRAINING_EXPERIENCE_ENUM} from "../../../../core/enums/training-experiance.enum";

@Component({
  selector: 'hs-user-survey',
  templateUrl: './user-survey-welcome.component.html',
  styleUrls: ['./user-survey-welcome.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    HSFormFieldModule,
    HSInputModule,
    ReactiveFormsModule,
    IQCheckboxModule,
    HSSelectModule,
    NgIf,
    HSButtonModule,
    NgClass
  ]
})
export class UserSurveyWelcomeComponent implements OnInit, OnDestroy {
  @Output() valueChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  protected readonly trainingTypeEnum = TRAINING_TYPE_ENUM;
  protected readonly trainingExperienceEnum = TRAINING_EXPERIENCE_ENUM;

  currentUserId: string;
  formGroup: FormGroup;
  genderEnum = GENDER_ENUM;
  user:ClientInterface;
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router,
  ) {

  }

  ngOnInit(): void {
    this.initForm()
    this.getUserState()
    this.listenForm()
    this.checkIsLoggedIn()

  }

  private checkIsLoggedIn() {
    const stream$ = this.authService.userState$.pipe(filter((user: ClientInterface | null) => user !== null)).subscribe((user: ClientInterface) => {
      this.user = user;
    });

    this.subscription.add(stream$);
  }

  private getUserState() {
    const stream$ = this.authService.userState$.pipe(filter((user: ClientInterface | null) => user !== null)).subscribe((user: ClientInterface) => {
      this.currentUserId = user.id;
      this.getMilsTextById();
    });

    this.subscription.add(stream$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initForm() {
    this.formGroup = this.fb.group({
      gender: [GENDER_ENUM.WOMEN, Validators.required],
      goal: [null, Validators.required],
      age: [null, [Validators.min(0)]],
      height: [null, [Validators.min(0)]],
      measurements: this.fb.group({
        weight: [null, [Validators.min(0)]],
        waist: [null, [Validators.min(0)]],
        hip: [null, [Validators.min(0)]],
        arm: [null, [Validators.min(0)]],
        chest: [null, [Validators.min(0)]],
        shoulders: [null, [Validators.min(0)]]
      }),
      stressLevel: [null, [Validators.min(1), Validators.max(10)]],
      activityLevel: [null, [Validators.min(1), Validators.max(10)]],
      intolerances: [''],
      healthStatus: [''],
      training: this.fb.group({
        frequencyPerWeek: [null, [Validators.min(0)]],
        type:[null],
        place:[null],
        trainingExperience:[null],
      }),
      breastfeeding: [false]
    });
  }

  private listenForm(): void {
    const stream$ = this.formGroup.valueChanges.subscribe((value: any) => {
      this.valueChange.emit(value);
    });

    this.subscription.add(stream$);
  }


  get genderControl(): AbstractControl {
    return this.formGroup.get('gender')
  }

  getMilsTextById(): void {
    this.firestore.collection('user-survey', ref => ref.where('id', '==', this.currentUserId))
      .valueChanges()
      .subscribe((survey: any[]) => {
        this.formGroup.patchValue(survey[0]);
        if (survey[0]) {
          // this.router.navigate(['/client/welcome']);
        }
      });
  }

  updateUserSurvey() {
    const formData = this.formGroup.value;
    console.log('Анкета:', formData, this.formGroup);

    if (this.formGroup.invalid || !this.currentUserId) {
      this.formGroup.markAllAsTouched();
      this.snackBar.open('Ви не вірно заповнили форму, перевірте поля', 'Закрити', { duration: 2000 });
      return;
    }

    const payload = {
      ...this.formGroup.value,
      id: this.currentUserId,
      createdAt: new Date()
    };

    console.log('payload====>', payload)

    const collectionRef = this.firestore.collection('user-survey', ref =>
      ref.where('id', '==', this.currentUserId)
    );

    collectionRef
      .get()
      .pipe(
        take(1),
        map(snapshot => snapshot.docs)
      )
      .subscribe(async docs => {
        try {
          if (docs.length === 0) {
            await this.firestore.collection('user-survey').add(payload);
            this.snackBar.open('Анкету додано успішно', 'Закрити', { duration: 2000 });
            this.router.navigate(['/client/welcome']);
          } else {
            const docId = docs[0].id;
            await this.firestore.collection('user-survey').doc(docId).update(payload);
            this.router.navigate(['/client/welcome']);
            this.snackBar.open('Анкету оновлено успішно', 'Закрити', { duration: 2000 });
          }
        } catch (error) {
          console.error('❌ Помилка збереження анкети:', error);
          this.snackBar.open('Помилка при збереженні', 'Закрити', { duration: 2000 });
        }
      });
  }

  get trainingExperienceControl(): AbstractControl {
    return this.formGroup.get('training').get('trainingExperience')
  }

  get goalControl(): AbstractControl {
    return this.formGroup.get('goal');
  }

}
