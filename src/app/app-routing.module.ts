import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  // {path: '**', redirectTo: '/auth/login'},
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/auth/login',
  },
  {
    path: '',
    loadChildren: () => import('./main/main.module').then((m) => m.MainModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'poll',
    loadChildren: () => import('./poll/poll.module').then((m) => m.PollModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
