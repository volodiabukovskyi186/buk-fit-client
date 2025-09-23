import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs';
import { AdminsService } from 'src/app/core/services/admins/admin.service';
import {AuthService} from "../../../../core/services/auth/auth.service";

@Component({
  selector: 'bk-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProgramComponent implements OnInit {
  user: any;
  exercises: any;

  constructor(
    private snackBar: MatSnackBar,
    public firestore: AngularFirestore,
    private authService: AuthService
  ){}
  ngOnInit(): void {
      this.getAdmin();
  }

  selectedDay: number = 0; // Початковий день (можна змінити)

  setDay(dayIndex: number): void {
    this.selectedDay = dayIndex;
  }

  getAdmin(): void {
    this.authService.userState$.pipe((filter((user: any) => user))).subscribe((user: any) => {
      this.user = user;
      this.getProgramById();
    });
  }

  getProgramById(): void {
    this.firestore.collection('exercises', ref => ref.where('id', '==', this.user.id))
      .valueChanges()
      .subscribe((users: any[]) => {
        this.exercises = users[0]?.days;
        console.log(' this.user', this.exercises);

      });
  }

  moveToVideo(link:string) {
    window.open(link);
  }
}
