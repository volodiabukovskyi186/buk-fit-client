import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';



import { MenuItemInterface, MenuSectionInterface } from '../../../core/interfaces/menu-item.interface';
import { MenuListService } from '../../../core/services/menu-list.service';
// import { PanelHeaderService } from '../panel-header/panel-header.service';
import { filter, Subscription } from 'rxjs';
import { AdminsService } from 'src/app/core/services/admins/admin.service';
import { PanelHeaderService } from 'src/app/core/services/panel-header.service';
import { USER_ROLES_ENUM } from 'src/app/core/enums/users-roles.enum';
import {AuthService} from "../../../core/services/auth/auth.service";
import {ClientInterface} from "../../../core/interfaces/user.interface";
import {TOKEN_ENUM} from "../../../core/enums/token.enum";

@Component({
  selector: 'hs-menu-list',
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MenuListComponent implements OnInit, OnDestroy {

  menuList: MenuSectionInterface[] =[];
  isOpenMobile = false;
  role = USER_ROLES_ENUM.CLIENT;
  private subscription: Subscription = new Subscription();
  constructor(
    private panelHeaderService: PanelHeaderService,
    private adminsService: AdminsService,
    private menuListService: MenuListService,
    private authService: AuthService,


    private router: Router
  )
  {}

  ngOnInit(): void {
    this.getAdmin();
    this.mobileMenuState();
  }

  getAdmin(): void {
    this.authService.userState$.pipe((filter((user: ClientInterface | null) => user !== null))).subscribe((user: ClientInterface) => {
      this.role = user.role;
      this.getMenuList();
    });
  }

  logOut(): void {
    this.authService.logout().subscribe(( data: any)=> {
      this.router.navigate(['/auth/login']);
    })
  }

  moveToUrl(menuItem: any): void {
    if (!menuItem?.url) return;
    this.router.navigate([`/panel/${menuItem?.url}`]);
    this.panelHeaderService.triggerMobileMenu(false);
  }

  closeMenu(): void {
    this.panelHeaderService.triggerMobileMenu(false);
  }

  ngOnDestroy(): void {
    this.closeMenu();
    this.subscription.unsubscribe();
  }

  private mobileMenuState(): void {
    const stream$ = this.panelHeaderService.triggerMobileMenu$.subscribe((isOpen: boolean) => {
      this.isOpenMobile = isOpen;
    });

    this.subscription.add(stream$);
  }

  private getMenuList(): void {

    const menu = JSON.parse(JSON.stringify(this.menuListService.getMenuList))

    menu.map((menu: MenuSectionInterface) => {
      const data =  menu.sections.filter((item: MenuItemInterface) => {
        return item.role === this.role;
      });

      menu.sections = data;
      return data;
    });


    this.menuList = menu;
    this.setOpenedMenu();
  }

  private setOpenedMenu(): void {
    this.menuList.forEach((menuItem) => {

      menuItem.sections.forEach((section: any) => {
        section.isOpen = false;

        if(!section?.children) return;

        section?.children.forEach((child: any) => {
          if (this.router.url.indexOf(child.url) !== -1) {
            section.isOpen = true;
          }
        });

      });
    });
  }

}
