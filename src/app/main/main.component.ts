import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { PanelHeaderService } from '../core/services/panel-header.service';
import {AuthService} from "../core/services/auth/auth.service";
import {ClientInterface} from "../core/interfaces/user.interface";
import {filter, Subscription} from "rxjs";
import {USER_STATUS_ENUM} from "../core/enums/users-status.enum";
import {LiqpayService} from "../core/services/payment/payament.service";
import {Router} from "@angular/router";

@Component({
  selector: 'bk-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit, OnDestroy {
  isOpen = false;
  user: ClientInterface;
  tgViewportHeight: string = '';
  tgViewportStableHeight: string = '';
  payment: any;
  userStatusEnum = USER_STATUS_ENUM

  private subscription: Subscription = new Subscription();
  showFiller: boolean = false
  constructor(
    private panelHeaderService: PanelHeaderService,
    private liqpayService: LiqpayService,
    private authService: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.checkIsLoggedIn();
    this.getCSSVariables();
    this.mobileMenuState();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  moveToPayment(): void {
    this.router.navigate(['client/payment']);
  }

  getActivePayments(): void {
    const stream$ = this.liqpayService.getActivePayments(this.user.id).subscribe((payment: any) => {
      this.payment = payment;
    });

    this.subscription.add(stream$);
  }

  openMenu(value): void {
    this.isOpen = value;
    this.panelHeaderService.triggerMobileMenu(this.isOpen)
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private checkIsLoggedIn(){
    const stream$ = this.authService.userState$.pipe(filter((user: ClientInterface | null) => user !== null)).subscribe((user: ClientInterface) => {
      this.user = user;
      this.getActivePayments();
    });

    this.subscription.add(stream$);
  }

  private getCSSVariables(): void {
    const root = document.documentElement;
    this.tgViewportHeight = getComputedStyle(root).getPropertyValue('--tg-viewport-height').trim();
    this.tgViewportStableHeight = getComputedStyle(root).getPropertyValue('--tg-viewport-stable-height').trim();
  }

  private mobileMenuState(): void {
    const stream$ = this.panelHeaderService.triggerMobileMenu$.subscribe((isOpen: boolean) => {
      this.isOpen = isOpen;
    });

    // this.subscription.add(stream$);
  }
}
