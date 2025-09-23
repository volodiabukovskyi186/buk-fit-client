import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs';
import { AdminsService } from 'src/app/core/services/admins/admin.service';

@Component({
  selector: 'bk-video-lessons',
  templateUrl: './video-lessons.component.html',
  styleUrls: ['./video-lessons.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProgramComponent implements OnInit {
  user: any;
  dailyMeals: any;

  constructor(
    private snackBar: MatSnackBar,
    public firestore: AngularFirestore,
    private adminsService: AdminsService
  ){}
  ngOnInit(): void {
      // this.getAdmin();
  }

  moveToVideos(): void {
    window.open('https://t.me/+CClDdWN7GrJjZjUy')
  }

  getAdmin(): void {
    this.adminsService.admin$.pipe((filter((user: any) => user))).subscribe((user: any) => {
      this.user = user;
      this.getProgramById();
    });
  }

  getProgramById(): void {
    this.firestore.collection('meals', ref => ref.where('id', '==', this.user.id))
      .valueChanges()
      .subscribe((users: any[]) => {
        this.dailyMeals = users[0].days;
        console.log(' this.user', this.dailyMeals);
        
      });
  }
}
