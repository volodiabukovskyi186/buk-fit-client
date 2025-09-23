import { Component, ViewEncapsulation } from '@angular/core';



export enum GENERAL_INFO_TABS_ENUM {
  DIET_CALCULATION = 'DIET_CALCULATION',
  NUTRATION = 'NUTRATION',
  NUTRATION_PLAN = 'NUTRATION_PLAN',
  WORKOUT_PROGRAM = 'WORKOUT_PROGRAM'
}

@Component({
  selector: 'bk-general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GeneralInfoComponent {
  userInfoTabsEnum = GENERAL_INFO_TABS_ENUM; 
  selectedView = GENERAL_INFO_TABS_ENUM.WORKOUT_PROGRAM

  setTabView(data: any): void {
    this.selectedView = data;
  }
}
