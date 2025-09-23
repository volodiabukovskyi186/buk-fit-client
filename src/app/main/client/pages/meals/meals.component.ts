import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs';
import { AdminsService } from 'src/app/core/services/admins/admin.service';
import {AuthService} from "../../../../core/services/auth/auth.service";

@Component({
  selector: 'bk-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProgramComponent implements OnInit {
  user: any;
  dailyMeals: any;
  dailyMealsText: any;

  constructor(
    private snackBar: MatSnackBar,
    public firestore: AngularFirestore,
    private authService: AuthService
  ){}
  ngOnInit(): void {
      this.getAdmin();
  }

  getAdmin(): void {
    this.authService.userState$.pipe((filter((user: any) => user))).subscribe((user: any) => {
      this.user = user;
      this.getMilsTextById();
    });
  }


  getMilsTextById(): void {
    this.firestore.collection('meals', ref => ref.where('id', '==', this.user.id))
      .valueChanges()
      .subscribe((dailyMealsText: any[]) => {
        console.log(' this.user', dailyMealsText);
        this.dailyMealsText = dailyMealsText[0];


      });
  }
}
