import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {HSInputDirective} from "src/app/core/components/input";

// ─── Routing ─────────────────────────────────────────────────────────────────
import { BodyMetricsRoutingModule } from './body-metrics-routing.module';

// ─── Angular Material ─────────────────────────────────────────────────────────
import { MatDialogModule } from '@angular/material/dialog';

// ─── Project components ───────────────────────────────────────────────────────
import { HSButtonModule } from '../../../../core/components/button/button.module';
import { HSFormFieldModule } from '../../../../core/components/form-field/form-field.module';
import { HSInputModule } from '../../../../core/components/input/input.module';
import { HSSelectModule } from '../../../../core/components/select/select.module';
import { LoaderComponent } from '../../../../core/components/loader/loader.component';

// ─── ngx-echarts ─────────────────────────────────────────────────────────────
import { NgxEchartsModule } from 'ngx-echarts';

// ─── Components ───────────────────────────────────────────────────────────────
import { BodyMetricsPageComponent } from './components/body-metrics-page/body-metrics-page.component';
import { BodyMetricsDetailsComponent } from './components/body-metrics-details/body-metrics-details.component';
import { BodyMetricsChartComponent } from './components/body-metrics-chart/body-metrics-chart.component';
import { BodyMetricsEntryDialogComponent } from './components/body-metrics-entry-dialog/body-metrics-entry-dialog.component';
import { ConfirmDeleteDialogComponent } from './components/confirm-delete-dialog/confirm-delete-dialog.component';

@NgModule({
  declarations: [
    BodyMetricsPageComponent,
    BodyMetricsDetailsComponent,
    BodyMetricsChartComponent,
    BodyMetricsEntryDialogComponent,
    ConfirmDeleteDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BodyMetricsRoutingModule,

    // Material (dialog only)
    MatDialogModule,

    // Project components
    HSButtonModule,
    HSFormFieldModule,
    HSInputModule,
    HSSelectModule,
    LoaderComponent,

    // ECharts — lazy-load the echarts core to keep bundle small
    NgxEchartsModule.forChild(),
    HSInputDirective,
  ],
})
export class BodyMetricsModule {}
