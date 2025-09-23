import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {WelcomePageComponent} from "./pages/welcome-page/welcome-page.component";
import {UserProfileComponent} from "./pages/user-profile/user-profile.component";
import {UserSurveyWelcomeComponent} from "./pages/user-survey-welcome/user-survey-welcome.component";
import {PaymentComponent} from "./pages/payment/payment.component";

const routes: Routes = [
  {
    path: 'general-info',
    loadChildren: () => import('./pages/general-info/general-info.module').then((m) => m.GeneralInfoModule),
  },
  {
    path: 'program',
    loadChildren: () => import('./pages/program/program.module').then((m) => m.ProgramModule),
  },
  {
    path: 'meals',
    loadChildren: () => import('./pages/meals/meals.module').then((m) => m.MealsModule),
  },
  {
    path: 'calculate-calories',
    loadChildren: () => import('./pages/calculate-calories/calculate-calories.module').then((m) => m.CalculateCaloriesModule),
  },
  {
    path: 'video-lessons',
    loadChildren: () => import('./pages/video-lessons/video-lessons.module').then((m) => m.VideoLessonsModule),
  },
  {
    path: 'welcome',
    component: WelcomePageComponent
  },
  {
    path: 'survey-welcome',
    component: UserSurveyWelcomeComponent
  },
  {
    path: 'user-profile',
    component: UserProfileComponent
  },
  {
    path: 'payment',
    component: PaymentComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
