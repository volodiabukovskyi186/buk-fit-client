import { AfterContentInit, Component, HostBinding, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'hs-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StatusComponent implements OnInit {
  @Input() statusType = '';

  @Input()
  set type(value: string) {
    this.statusType = value;
    this.setData();
  }

  @Input() isDot = false;

  title: string;
  styleClass: string;

  @HostBinding('class')
  get colorClass(): string {
    return `status-${this.styleClass}`;
  }

  ngOnInit(): void {
    this.setData();
  }

  private setData(): void {
    
    switch (this.statusType) {

      case 'ON_HOLD':
        this.title = 'GENERAL.STATUS.ON_HOLD';
        this.styleClass = 'on-hold';
        return;

      case 'CLIENT_REPLY':
        this.title = 'GENERAL.STATUS.CLIENT_REPLY';
        this.styleClass = 'client-replay';
        return;

      case 'LOW':
        this.title = 'GENERAL.STATUS.LOW';
        this.styleClass = 'low';
        return;

      case 'IN_PROGRESS':
        this.title = 'GENERAL.STATUS.IN_PROGRESS';
        this.styleClass = 'in-progress';
        return;

      case 'URGENT':
        this.title = 'GENERAL.STATUS.URGENT';
        this.styleClass = 'urgent';
        return;

      case 'MEDIUM':
        this.title = 'GENERAL.STATUS.MEDIUM';
        this.styleClass = 'medium';
        return;

      case 'HIGH':
        this.title = 'GENERAL.STATUS.HIGH';
        this.styleClass = 'high';
        return;

      case 'ACTIVE':
        this.title = 'GENERAL.STATUS.ACTIVE';
        this.styleClass = 'active';
        return;

      case 'NEW':
        this.title = 'GENERAL.STATUS.NEW';
        this.styleClass = 'new';
        return;

      case 'ANSWERED':
        this.title = 'GENERAL.STATUS.NOT_ACTIVE';
        this.styleClass = 'answered';
        return;

      case 'CLOSED':
        this.title = 'GENERAL.STATUS.NOT_ACTIVE';
        this.styleClass = 'closed';
        return;

      case 'NOT_ACTIVE':
        this.title = 'GENERAL.STATUS.NOT_ACTIVE';
        this.styleClass = 'not-active';
        return;

      case 'BLOCKED':
        this.title = 'GENERAL.STATUS.BLOCKED';
        this.styleClass = 'blocked';
        return;

      case 'DELETED':
        this.title = 'GENERAL.STATUS.DELETED';
        this.styleClass = 'deleted';
        return;

      case 'ADDED_TO_QUEUE':
        this.title = 'GENERAL.STATUS.ADDED_TO_QUEUE';
        this.styleClass = 'add-to-queuq';
        return;

      default:
        this.title = this.type;
    }


  }

}
