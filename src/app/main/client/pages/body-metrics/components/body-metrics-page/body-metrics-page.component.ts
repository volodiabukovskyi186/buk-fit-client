import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { BodyMetricsFacade } from '../../store/body-metrics.facade';
import { AuthService } from '../../../../../../core/services/auth/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'bk-body-metrics-page',
  templateUrl: './body-metrics-page.component.html',
  styleUrls: ['./body-metrics-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  providers: [BodyMetricsFacade],
})
export class BodyMetricsPageComponent implements OnInit {

  readonly facade = inject(BodyMetricsFacade);
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    this.auth.userFirebase$.pipe(take(1)).subscribe(user => {
      if (user?.uid) {
        this.facade.load(user.uid);
      }
    });
  }
}
