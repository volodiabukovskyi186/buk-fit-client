import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BodyMetricsPageComponent } from './components/body-metrics-page/body-metrics-page.component';

const routes: Routes = [
  {
    path: '',
    component: BodyMetricsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BodyMetricsRoutingModule {}
