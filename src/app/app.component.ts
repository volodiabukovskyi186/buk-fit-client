import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter, Subscription} from "rxjs";
import {AuthService} from "./core/services/auth/auth.service";
import {ClientInterface} from "./core/interfaces/user.interface";
import {USER_STATUS_ENUM} from "./core/enums/users-status.enum";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'buk-fit-client';
  tg: any;
  chatId: any
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.initTelegram();
    this.checkTokenAndLogin();
    this.setViewportHeight();
    this.getUserState();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getUserState() {
    const stream$= this.authService.userState$.pipe().subscribe((user:ClientInterface) => {

      if (user.status === USER_STATUS_ENUM.BLOCKED || user.status === USER_STATUS_ENUM.DELETED) {
        this.authService.logout();
        this.snackBar.open('Ваш акаунт заблоковано, зверніться до адміністратора')
        this.router.navigate(['/auth/login']);
      }

      console.log('user1231', user)

      // if (user.status === USER_STATUS_ENUM.NEW) {
      //   this.router.navigate(['/client/survey-welcome']);
      // }

    });


    this.subscription.add(stream$);
  }

  private initTelegram(): void {
    this.tg = (window as any)?.Telegram?.WebApp;
    // const initDataUnsafe = this.tg?.initDataUnsafe;
    // this.chatId = initDataUnsafe?.chat?.id;
    // console.log('this.tg---->', this.tg)
    // if (this.chatId) {
    //   localStorage.setItem('tg_chat_id', this.chatId);
    // }

    if (this?.tg) {
      this.tg.expand();
      this.tg.disableVerticalSwipes();
      this.tg.disableClosingConfirmation();
      this.tg.setBackgroundColor('#ffffff');
      console.log("Telegram Web App розширено на весь екран!");
    } else {
      console.error("Telegram Web App не знайдено!");
    }
  }

  private checkTokenAndLogin(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {

      const token = localStorage.getItem('token');
      const authPages = ['/auth/login', '/auth/register', '/auth'];

      if (token && authPages.includes(event.urlAfterRedirects)) {
       this.router.navigate(['/client/program']);
      }
    });
  }

  private setViewportHeight(): void {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }

}
