import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';
import { BodyMetricsEntry, BodyMetricsEntryCreate, BodyMetricsEntryUpdate } from '../models/body-metrics.models';
import { GOAL_ENUM } from '../../../../../core/enums/goal.enum';

export interface SurveyDefaults {
  heightCm?: number;
  weightKg?: number;
  waistCm?: number;
  hipsCm?: number;
  chestCm?: number;
  goal?: GOAL_ENUM;
}

@Injectable({ providedIn: 'root' })
export class BodyMetricsService {

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
  ) {}

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private col(userId: string) {
    return this.firestore.collection<Omit<BodyMetricsEntry, 'id'>>(
      `body/${userId}/metrics`,
      ref => ref.orderBy('createdAt', 'desc'),
    );
  }

  // ─── Survey defaults ────────────────────────────────────────────────────────

  getClientWeight(userId: string): Observable<number | null> {
    return this.firestore
      .collection('clients')
      .doc(userId)
      .valueChanges()
      .pipe(map((doc: any) => doc?.weight ?? null));
  }

  getSurveyDefaults(userId: string): Observable<SurveyDefaults> {
    return this.firestore
      .collection('user-survey', ref => ref.where('id', '==', userId).limit(1))
      .valueChanges()
      .pipe(
        map((docs: any[]) => {
          const doc = docs[0];
          if (!doc) return {};
          return {
            heightCm:  doc.height             ?? undefined,
            weightKg:  doc.measurements?.weight ?? undefined,
            waistCm:   doc.measurements?.waist  ?? undefined,
            hipsCm:    doc.measurements?.hip    ?? undefined,
            chestCm:   doc.measurements?.chest  ?? undefined,
            goal:      doc.goal                ?? undefined,
          };
        }),
      );
  }

  // ─── Survey mutations ────────────────────────────────────────────────────────

  async updateGoal(userId: string, goal: GOAL_ENUM): Promise<void> {
    const snapshot = await this.firestore
      .collection('user-survey', ref => ref.where('id', '==', userId).limit(1))
      .get()
      .toPromise();

    if (!snapshot || snapshot.empty) return;
    await snapshot.docs[0].ref.update({ goal });
  }

  // ─── Queries ────────────────────────────────────────────────────────────────

  getEntries(userId: string): Observable<BodyMetricsEntry[]> {
    return this.col(userId).snapshotChanges().pipe(
      map(actions =>
        actions.map(a => ({
          ...(a.payload.doc.data() as Omit<BodyMetricsEntry, 'id'>),
          id: a.payload.doc.id,
        })),
      ),
    );
  }

  // ─── Mutations ──────────────────────────────────────────────────────────────

  async addEntry(
    userId: string,
    payload: BodyMetricsEntryCreate,
    photoFile?: File,
  ): Promise<string> {
    const docRef = this.firestore.collection(`body/${userId}/metrics`).doc();

    let photoUrl: string | undefined;
    if (photoFile) {
      photoUrl = await this.uploadPhoto(userId, docRef.ref.id, photoFile);
    }

    const entry: Omit<BodyMetricsEntry, 'id'> = {
      userId,
      createdAt: payload.createdAt ?? Timestamp.now(),
      weightKg: payload.weightKg,
      ...(payload.heightCm != null && { heightCm: payload.heightCm }),
      ...(payload.waistCm != null && { waistCm: payload.waistCm }),
      ...(payload.hipsCm != null && { hipsCm: payload.hipsCm }),
      ...(payload.chestCm != null && { chestCm: payload.chestCm }),
      ...(payload.note && { note: payload.note }),
      ...(photoUrl && { photoUrl }),
    };

    await docRef.set(entry as any);
    return docRef.ref.id;
  }

  async updateEntry(
    userId: string,
    id: string,
    payload: BodyMetricsEntryUpdate,
    photoFile?: File,
  ): Promise<void> {
    let updates: Partial<BodyMetricsEntry> = { ...payload };

    if (photoFile) {
      updates.photoUrl = await this.uploadPhoto(userId, id, photoFile);
    }

    await this.firestore
      .collection(`body/${userId}/metrics`)
      .doc(id)
      .update(updates as any);
  }

  async deleteEntry(userId: string, id: string): Promise<void> {
    await this.firestore
      .collection(`body/${userId}/metrics`)
      .doc(id)
      .delete();
  }

  // ─── Storage ────────────────────────────────────────────────────────────────

  private uploadPhoto(userId: string, entryId: string, file: File): Promise<string> {
    const path = `body-metrics/${userId}/${entryId}_${Date.now()}`;
    const ref = this.storage.ref(path);
    const task = this.storage.upload(path, file);

    return new Promise((resolve, reject) => {
      task.snapshotChanges().pipe(
        finalize(async () => {
          try {
            const url = await ref.getDownloadURL().toPromise();
            resolve(url);
          } catch (e) {
            reject(e);
          }
        }),
      ).subscribe({ error: reject });
    });
  }
}
