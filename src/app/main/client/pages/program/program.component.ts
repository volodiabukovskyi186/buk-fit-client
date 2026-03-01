import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs';
import { AdminsService } from 'src/app/core/services/admins/admin.service';
import {AuthService} from "../../../../core/services/auth/auth.service";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'bk-program',
    templateUrl: './program.component.html',
    styleUrls: ['./program.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class ProgramComponent implements OnInit {
  user: any;
  exercises: any;
  isVideoDrawerOpen = false;
  activeVideoLink = '';
  activeVideoSafeUrl: SafeResourceUrl | null = null;
  isEmbeddedPlayer = false;

  constructor(
    private snackBar: MatSnackBar,
    public firestore: AngularFirestore,
    private authService: AuthService,
    private sanitizer: DomSanitizer
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
        console.log('exercises', this.exercises);

      });
  }

  openVideoDrawer(link: string): void {
    if (!link) {
      return;
    }

    this.activeVideoLink = link;
    const embeddedVideoLink = this.getEmbeddedVideoLink(link);
    this.isEmbeddedPlayer = embeddedVideoLink !== link;
    this.activeVideoSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.isEmbeddedPlayer ? embeddedVideoLink : link
    );
    this.isVideoDrawerOpen = true;
  }

  closeVideoDrawer(): void {
    this.isVideoDrawerOpen = false;
    this.activeVideoSafeUrl = null;
    this.activeVideoLink = '';
    this.isEmbeddedPlayer = false;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.isVideoDrawerOpen) {
      this.closeVideoDrawer();
    }
  }

  private getEmbeddedVideoLink(link: string): string {
    try {
      const url = new URL(link);

      if (url.hostname.includes('youtu.be')) {
        const id = url.pathname.replace('/', '');
        return `https://www.youtube.com/embed/${id}`;
      }

      if (url.hostname.includes('youtube.com')) {
        const id = url.searchParams.get('v');
        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }

      if (url.hostname.includes('vimeo.com')) {
        const id = url.pathname.split('/').filter(Boolean)[0];
        if (id) {
          return `https://player.vimeo.com/video/${id}`;
        }
      }

      return link;
    } catch {
      return link;
    }
  }
}
