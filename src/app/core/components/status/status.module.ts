import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusComponent } from './status.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    StatusComponent
  ],
  imports: [
    TranslateModule,
    CommonModule
  ],
  exports:[StatusComponent]
})
export class HSStatusModule { }
