import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './main.component';


const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      // {
      //   path: '',
      //   redirectTo: 'messages'
      // },
      // {
      //   path: '**',
      //   redirectTo: 'messages'
      // },
      {
        path: 'client',
        loadChildren: () => import('./client/client.module').then((m) => m.ClientModule),
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
