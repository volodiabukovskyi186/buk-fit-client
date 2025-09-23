import {Component, OnDestroy, OnInit} from '@angular/core';
import {filter, Subscription} from "rxjs";
import {ClientInterface} from "../../../../core/interfaces/user.interface";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {USER_STATUS_ENUM} from "../../../../core/enums/users-status.enum";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'app-account-blocked',
  templateUrl: './account-blocked.component.html',
  styleUrls: ['./account-blocked.component.scss']
})
export class AccountBlockedComponent implements OnInit, OnDestroy {
  user: ClientInterface
  userStatusEnum = USER_STATUS_ENUM;
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.checkIsLoggedIn();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private checkIsLoggedIn() {
    const stream$ = this.authService.userState$.pipe(filter((user: ClientInterface | null) => user !== null)).subscribe((user: ClientInterface) => {
      this.user = user;

      // if(this.user?.status === USER_STATUS_ENUM.DELETED || this.user?.status === USER_STATUS_ENUM.BLOCKED) {
      //   this.snackBar.open('Ваш акаунт заблоковано зверніться до адміністратора')
      // } else {
      //   this.router.navigate(['/client/program']);
      // }
    });

    this.subscription.add(stream$);
  }

  checkStatus() {
    this.checkIsLoggedIn();
  }
}
