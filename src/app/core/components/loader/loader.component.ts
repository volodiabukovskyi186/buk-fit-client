import {NgTemplateOutlet} from "@angular/common";
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'hs-loader-ui',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  imports: [
    NgTemplateOutlet
  ],
  encapsulation: ViewEncapsulation.None
})
export class LoaderComponent {}
