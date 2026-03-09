import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { BodyMetricsService } from './body-metrics.service';

const MS_7_DAYS = 7 * 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class BodyMetricsAlertService {

  /** true = no entries OR latest entry is older than 7 days */
  readonly needsAlert$: Observable<boolean>;

  constructor(auth: AuthService, bms: BodyMetricsService) {
    this.needsAlert$ = auth.userFirebase$.pipe(
      switchMap(user => user?.uid ? bms.getEntries(user.uid) : of([])),
      map(entries => {
        if (!entries.length) return true;
        const latest = entries[0];
        return Date.now() - latest.createdAt.toMillis() > MS_7_DAYS;
      }),
    );
  }
}
