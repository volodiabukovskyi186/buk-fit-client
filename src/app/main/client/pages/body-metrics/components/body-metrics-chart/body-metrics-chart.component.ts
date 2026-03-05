import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { EChartsOption } from 'echarts';
import { BodyMetricsFacade } from '../../store/body-metrics.facade';
import { ChartRange } from '../../models/body-metrics.models';

const RANGES: { label: string; value: ChartRange }[] = [
  { label: '7д',   value: '7d' },
  { label: '30д',  value: '30d' },
  { label: '90д',  value: '90d' },
  { label: 'Весь', value: 'all' },
];

@Component({
  selector: 'bk-body-metrics-chart',
  templateUrl: './body-metrics-chart.component.html',
  styleUrls: ['./body-metrics-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class BodyMetricsChartComponent {

  readonly facade = inject(BodyMetricsFacade);
  readonly ranges = RANGES;

  readonly chartOptions = computed<EChartsOption | null>(() => {
    const data = this.facade.chartData();
    if (data.length < 2) return null;

    const dates = data.map(p =>
      p.date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
    );
    const weights = data.map(p => p.weightKg);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const padding = Math.max(1, (max - min) * 0.2);

    return {
      backgroundColor: 'transparent',
      grid: { top: 20, right: 16, bottom: 40, left: 44 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: '#252525', fontFamily: 'Montserrat', fontSize: 13 },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const idx = p.dataIndex as number;
          const fullDate = data[idx].date.toLocaleDateString('uk-UA', {
            day: '2-digit', month: 'long', year: 'numeric',
          });
          return `<div style="font-weight:700;margin-bottom:4px">${fullDate}</div>${p.value} кг`;
        },
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#25252561',
          fontFamily: 'Montserrat',
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        min: +(min - padding).toFixed(1),
        max: +(max + padding).toFixed(1),
        splitNumber: 4,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F0F0F0' } },
        axisLabel: {
          color: '#25252561',
          fontFamily: 'Montserrat',
          fontSize: 11,
          formatter: (v: number) => `${v}`,
        },
      },
      series: [
        {
          type: 'line',
          data: weights,
          smooth: 0.3,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: '#3FA1FB', width: 2.5 },
          itemStyle: { color: '#3FA1FB', borderColor: '#fff', borderWidth: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(63,161,251,0.25)' },
                { offset: 1, color: 'rgba(63,161,251,0.02)' },
              ],
            },
          },
        },
      ],
    };
  });

  readonly hasEnoughData = computed(() => this.facade.chartData().length >= 2);
}
