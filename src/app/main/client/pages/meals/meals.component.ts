import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { filter, take } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface MealItem {
  type: MealType;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  content: string;
}

export interface MealsDocument {
  id: string;
  text?: string;
  meals?: MealItem[];
}

export interface ContentLine {
  type: 'heading' | 'bullet' | 'empty';
  text: string;
}

export const MEAL_META: Record<MealType, { emoji: string; label: string; color: string; bg: string }> = {
  BREAKFAST: { emoji: '🌅', label: 'Сніданок', color: '#F2AF4A', bg: 'rgba(242,175,74,0.12)' },
  LUNCH:     { emoji: '☀️',  label: 'Обід',     color: '#27AE60', bg: 'rgba(39,174,96,0.12)'  },
  DINNER:    { emoji: '🌙', label: 'Вечеря',   color: '#9B51E0', bg: 'rgba(155,81,224,0.12)' },
  SNACK:     { emoji: '🍎', label: 'Перекус',  color: '#3FA1FB', bg: 'rgba(63,161,251,0.12)' },
};

@Component({
  selector: 'bk-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ProgramComponent implements OnInit {
  mealsDoc: MealsDocument | null = null;
  loading = true;
  readonly mealMeta = MEAL_META;

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.userState$
      .pipe(filter((u: any) => !!u), take(1))
      .subscribe((user: any) => this.loadMeals(user.id));
  }

  private loadMeals(userId: string): void {
    this.firestore
      .collection<MealsDocument>('meals', ref => ref.where('id', '==', userId))
      .valueChanges()
      .pipe(take(1))
      .subscribe(docs => {
        this.mealsDoc = docs?.[0] ?? null;
        this.loading = false;
      });
  }

  get hasMeals(): boolean {
    return !!(this.mealsDoc?.meals?.length);
  }

  get hasText(): boolean {
    return !!(this.mealsDoc?.text);
  }

  get totals(): { calories: number; protein: number; fat: number; carbs: number } {
    const meals = this.mealsDoc?.meals ?? [];
    return meals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.calories ?? 0),
        protein:  acc.protein  + (m.protein  ?? 0),
        fat:      acc.fat      + (m.fat      ?? 0),
        carbs:    acc.carbs    + (m.carbs    ?? 0),
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 },
    );
  }

  parseContent(content: string): ContentLine[] {
    if (!content) return [];
    return content.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return { type: 'empty' as const, text: '' };
      if (trimmed.startsWith('*')) return { type: 'bullet' as const, text: trimmed.slice(1).trim() };
      return { type: 'heading' as const, text: trimmed };
    });
  }

  trackByType(_: number, meal: MealItem): string {
    return meal.type;
  }
}
