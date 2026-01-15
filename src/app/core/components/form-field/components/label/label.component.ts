import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'hs-label',
    templateUrl: 'label.component.html',
    styleUrls: ['label.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class HSLabelComponent {
  @Input() hint = '';
}
