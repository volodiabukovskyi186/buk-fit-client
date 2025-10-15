import {NgForOf} from "@angular/common";
import {EventEmitter} from "@angular/core";
import {Output} from "@angular/core";
import {ViewEncapsulation} from "@angular/core";
import {OnInit} from "@angular/core";
import {Input} from "@angular/core";
import { Component } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {PollStepperInterface} from "src/app/poll/poll/features/poll-stepper/interfaces/poll-stepper.interface";
import {PollStepperService} from "src/app/poll/poll/features/poll-stepper/services/poll-stepper.service";

@Component({
  selector: 'app-poll-stepper-welcome',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './poll-stepper-welcome.component.html',
  styleUrl: './poll-stepper-welcome.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PollStepperWelcomeComponent implements OnInit {
  @Output() start= new EventEmitter<boolean>()
  type = null
  constructor(
    private pollStepperService: PollStepperService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const type = this.route.snapshot.queryParams['type'] ?? 'TRAINING_HOME';
    this.type = this.route.snapshot.queryParams['type'];
  }

  startGuide(): void {
    this.start.emit(true)
  }

}
