import {Injectable} from '@angular/core';
import {FirebaseApp, getApp, initializeApp} from 'firebase/app';
import {

  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import {BehaviorSubject, catchError, defer, filter, from, Observable, throwError} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {map, switchMap, take} from 'rxjs/operators';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {ClientInterface} from "../../interfaces/user.interface";
import {sendPasswordResetEmail} from "@angular/fire/auth";
import { Auth, createUserWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import {doc} from "@angular/fire/firestore";
import {USER_STATUS_ENUM} from "../../enums/users-status.enum";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseApp!: FirebaseApp;
  private auth!: ReturnType<typeof getAuth>;

  private userFirebaseSubject = new BehaviorSubject<User | null>(null);
  public userFirebase$: Observable<User | null> = this.userFirebaseSubject.asObservable();

  private userSubject = new BehaviorSubject<ClientInterface | null>(null);
  userState$: Observable<ClientInterface>;

  constructor(
    private firestore: AngularFirestore
  ) {
    this.initFirebase();
    this.userState$ = this.userSubject.asObservable().pipe(filter(user => !!user));
  }

  private async initFirebase() {
    try {
      this.firebaseApp = getApp();
    } catch (error) {
      this.firebaseApp = initializeApp(environment.firebase);
    }

    this.auth = getAuth(this.firebaseApp);
    this.monitorAuthState();
    console.log('✅ Firebase ініціалізовано:', this.firebaseApp);
  }

  removeUser(): void {
    this.userSubject.next(null);
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  getUserById(uid: string): void {
    this.firestore.collection('clients').doc(uid).snapshotChanges().pipe(
      map(snapshot => {
        const data: any = snapshot.payload.data();

        return data ? {id: snapshot.payload.id, ...data} : null;
      })
    ).subscribe((user) => {
      this.userSubject.next(user);
    })
  }

  loginNotCheckUser(email: string, password: string): Observable<string> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(userCredential => from(userCredential.user.getIdToken()))
    );
  }

  login(email: string, password: string): Observable<string> {


    return from(signInWithEmailAndPassword(this.auth,email, password)).pipe(
      switchMap((userCredential) => {

        const uid = userCredential.user?.uid;
        if (!uid) {
          return throwError(() => new Error('Не вдалося отримати UID користувача'));
        }

        return this.firestore.collection('clients').doc(uid).get().pipe(
          switchMap((docSnap) => {

            if (!docSnap.exists) {
              return throwError(() => ({
                message: '❌ Користувач не знайдений.',
                code: 'auth/user-not-found',
              }));
            }

            const userData: any = docSnap.data();

            if (userData.status === USER_STATUS_ENUM.DELETED || userData.status === USER_STATUS_ENUM.BLOCKED) {
              return throwError(() => ({
                message: 'Обліковий запис видалений або заблокований. Вхід заборонено.',
                code: USER_STATUS_ENUM.BLOCKED,
              }));
            }

            return from(userCredential.user?.getIdToken() ?? Promise.reject('Не вдалося отримати токен'));
          })
        );
      }),
      catchError((error) => {
        let errorMessage = 'Помилка входу. Спробуйте ще раз.';

        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Користувача не знайдено.';
        } else if (error.code === USER_STATUS_ENUM.BLOCKED) {
          errorMessage = 'Ваш акаунт заблокований або видалений, зверніться до адміністратора.';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Неправильний пароль.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Невірний формат email.';
        } else if (error.message.includes('Обліковий запис видалений')) {
          errorMessage = error.message;
        }

        this.logout();
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(email: string, password: string): Observable<string> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      map((userCredential: UserCredential) => userCredential.user?.uid || '') // ✅ Повертаємо тільки UID
    );
  }

  isLoggedIn(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const unsubscribe = onAuthStateChanged(this.auth, user => {
        if (user) {
          this.getUserById(user.uid);
        }

        observer.next(!!user);
        observer.complete();
      });

      return () => unsubscribe();
    }).pipe(take(1));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      map(() => {
        this.userFirebaseSubject.next(null);
        this.userSubject.next(null);

        localStorage.clear();
        sessionStorage.clear();
      })
    );
  }

  private monitorAuthState() {
    onAuthStateChanged(this.auth, (user) => {
      this.userFirebaseSubject.next(user);
      console.log(user ? `Користувач залогований: ${user.email}` : 'Користувач не залогований');
    });
  }

}
