import { Injectable } from '@angular/core';

import { MenuSectionInterface } from '../interfaces/menu-item.interface';
import { USER_ROLES_ENUM } from '../enums/users-roles.enum';

@Injectable({
  providedIn: 'root'
})
export class MenuListService {

  constructor() { }

  get getMenuList(): MenuSectionInterface[] {
    return this.menuList;
  }

  private menuList: MenuSectionInterface[] = [
    {
      title: 'Головна',
      sections: [
        {
          title: 'Загальна',
          icon: '',
          isOpen: false,
          url: 'client/general-info',
          role:USER_ROLES_ENUM.CLIENT
        },
        {
          title: 'Прогрес',
          icon: '',
          isOpen: false,
          url: 'client/body-metrics',
          role: USER_ROLES_ENUM.CLIENT
        },
        {
          title: 'Тренування',
          icon: '',
          isOpen: false,
          url: 'client/program',
          role:USER_ROLES_ENUM.CLIENT
        },
        {
          title: 'Харчування',
          icon: '',
          isOpen: false,
          url: 'client/meals',
          role:USER_ROLES_ENUM.CLIENT
        },
        {
          title: 'Мій профіль',
          icon: '',
          isOpen: false,
          url: 'client/user-profile',
          role:USER_ROLES_ENUM.CLIENT
        },
        // {
        //   title: 'Оплата',
        //   icon: '',
        //   isOpen: false,
        //   url: 'client/payment',
        //   role:USER_ROLES_ENUM.CLIENT
        // },
      ]
    },
  ]
}
