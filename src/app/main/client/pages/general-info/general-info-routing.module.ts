import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralInfoComponent } from './general-info.component';

const routes: Routes = [
  {
    path:'',
    component: GeneralInfoComponent,
  },
  // {
  //   path:'create-post',
  //   component: CreatePostComponent,
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralInfoRoutingModule { }
