import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';

import {CommonModule} from "@angular/common";
import {ClientInterface} from "../../../../core/interfaces/user.interface";
import {USER_STATUS_ENUM} from "../../../../core/enums/users-status.enum";
import {filter, Subscription} from "rxjs";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'hs-welcome-page',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WelcomePageComponent implements OnInit, OnDestroy {
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
    console.log('888888')
    this.checkIsLoggedIn();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private checkIsLoggedIn() {
    const stream$ = this.authService.userState$.pipe(filter((user: ClientInterface | null) => user !== null)).subscribe((user: ClientInterface) => {
      this.user = user;
      console.log('21312312313')
      if (this.user.status == USER_STATUS_ENUM.ACTIVE) {
        this.router.navigate(['/client/program']);
      }

    });

    this.subscription.add(stream$);
  }
}
