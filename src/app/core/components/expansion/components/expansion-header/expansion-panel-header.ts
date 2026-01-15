import { FocusableOption, FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { ENTER, hasModifierKey, SPACE } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Host,
  Inject,
  Input,
  OnDestroy,
  Optional,
  ViewEncapsulation,
} from '@angular/core';

import { EMPTY, merge, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { HSExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { HSAccordionTogglePosition } from '../accordion/accordion-base';
import { indicatorRotateAnimations } from '../../expansion.animations';

@Component({
  selector: 'hs-expansion-panel-header',
  styleUrls: ['expansion-panel-header.scss'],
  templateUrl: 'expansion-panel-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [indicatorRotateAnimations],
  // якщо вам потрібно підтримати Input з іменем tabIndex (як раніше) — залишайте inputs
  // але краще просто мати @Input() tabIndex
  host: {
    class: 'hs-expansion-panel-header hs-focus-indicator',
    role: 'button',
    '[attr.id]': 'panel._headerId',
    // якщо disabled — робимо елемент нефокусованим
    '[attr.tabindex]': 'disabled ? -1 : tabIndex',
    '[attr.aria-controls]': '_getPanelId()',
    '[attr.aria-expanded]': '_isExpanded()',
    '[attr.aria-disabled]': 'panel.disabled',
    '[class.hs-expanded]': '_isExpanded()',
    '[class.hs-expansion-toggle-indicator-after]': `_getTogglePosition() === 'after'`,
    '[class.hs-expansion-toggle-indicator-before]': `_getTogglePosition() === 'before'`,
    '[class._hs-animation-noopable]': '_animationMode === "NoopAnimations"',
    '[style.height]': '_getHeaderHeight()',
    '(click)': '_toggle()',
    '(keydown)': '_keydown($event)',
  },
  standalone: false,
})
export class HSExpansionPanelHeaderComponent
  implements AfterViewInit, OnDestroy, FocusableOption
{
  @Input() collapsedHeight!: string;
  @Input() expandedHeight!: string;

  // Заміна mixinTabIndex:
  @Input() tabIndex = 0;

  private _parentChangeSubscription = Subscription.EMPTY;

  constructor(
    @Host() public panel: HSExpansionPanelComponent,
    private _element: ElementRef<HTMLElement>,
    private _focusMonitor: FocusMonitor,
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string,
    @Attribute('tabindex') tabIndexAttr?: string,
  ) {
    const accordionHideToggleChange = panel.accordion
      ? panel.accordion._stateChanges.pipe(
        filter(changes => !!(changes['hideToggle'] || changes['togglePosition'])),
      )
      : EMPTY;

    // підтримка tabindex з атрибуту (як у вас було)
    const parsed = Number.parseInt(tabIndexAttr || '', 10);
    this.tabIndex = Number.isFinite(parsed) ? parsed : 0;

    this._parentChangeSubscription = merge(
      panel.opened,
      panel.closed,
      accordionHideToggleChange,
      panel._inputChanges.pipe(
        filter(changes => !!(changes['hideToggle'] || changes['disabled'] || changes['togglePosition'])),
      ),
    ).subscribe(() => this._changeDetectorRef.markForCheck());

    panel.closed
      .pipe(filter(() => panel._containsFocus()))
      .subscribe(() => this._focusMonitor.focusVia(this._element, 'program'));
  }

  get disabled(): boolean {
    return this.panel.disabled;
  }

  _toggle(): void {
    if (!this.disabled) {
      this.panel.toggle();
    }
  }

  _isExpanded(): boolean {
    return this.panel.expanded;
  }

  _getExpandedState(): string {
    return this.panel._getExpandedState();
  }

  _getPanelId(): string {
    return this.panel.id;
  }

  _getTogglePosition(): HSAccordionTogglePosition {
    return this.panel.togglePosition;
  }

  _showToggle(): boolean {
    return !this.panel.hideToggle && !this.panel.disabled;
  }

  _getHeaderHeight(): string | null {
    const isExpanded = this._isExpanded();
    if (isExpanded && this.expandedHeight) return this.expandedHeight;
    if (!isExpanded && this.collapsedHeight) return this.collapsedHeight;
    return null;
  }

  _keydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case SPACE:
      case ENTER:
        if (!hasModifierKey(event)) {
          event.preventDefault();
          this._toggle();
        }
        break;

      default:
        if (this.panel.accordion) {
          this.panel.accordion._handleHeaderKeydown(event);
        }
        return;
    }
  }

  focus(origin?: FocusOrigin, options?: FocusOptions) {
    if (origin) {
      this._focusMonitor.focusVia(this._element, origin, options);
    } else {
      this._element.nativeElement.focus(options);
    }
  }

  ngAfterViewInit() {
    this._focusMonitor.monitor(this._element).subscribe(origin => {
      if (origin && this.panel.accordion) {
        this.panel.accordion._handleHeaderFocus(this);
      }
    });
  }

  ngOnDestroy() {
    this._parentChangeSubscription.unsubscribe();
    this._focusMonitor.stopMonitoring(this._element);
  }
}
