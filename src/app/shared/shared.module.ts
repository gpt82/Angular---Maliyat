import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RequiredLabelDirective } from './directives/required-label.directive';
import { DeleteDirective } from './directives/delete.directive';
import { DeleteDialog } from './dialogs/Delete/delete.dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../form/material.module';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import {
  MaterialPersianDateAdapter,
  PERSIAN_DATE_FORMATS
} from './material.persian-date.adapter';

import { EnLanguageDirective } from './directives/en-lang.directive';
import { GridContextMenuComponent } from '@shared/grid-context-menu.component';
import { PopupModule } from '@progress/kendo-angular-popup';
import { MultiCheckFilterComponent } from './custom-grid-filter/multicheck-filter.component';
import { PopupAnchorDirective } from './directives/popup.anchor-target.directive';
import { InCellTabDirective } from './directives/incell-tab.directive';
import { NumericSelectComponent } from './numeric-select/numeric-select.component';
import { FormsModule } from '@angular/forms';
import { PersianCalendarComponent } from './persian-calendar/persian-calendar.component';
import { OnlyNumberDirective } from './directives/onlynumber.directive';
@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MaterialModule,
    HttpClientModule,
    PopupModule
  ],
  declarations: [MultiCheckFilterComponent,
    RequiredLabelDirective,
    NumericSelectComponent,
    PersianCalendarComponent,
    DeleteDirective,
    EnLanguageDirective,
    InCellTabDirective,
    PopupAnchorDirective,
    OnlyNumberDirective,
    DeleteDialog,
    GridContextMenuComponent
  ],
  exports: [
    NumericSelectComponent,
    PersianCalendarComponent,
    MaterialModule,
    RequiredLabelDirective,
    DeleteDirective,
    OnlyNumberDirective,
    EnLanguageDirective,
    InCellTabDirective,
    PopupAnchorDirective,
    MultiCheckFilterComponent,
    GridContextMenuComponent
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MaterialPersianDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: PERSIAN_DATE_FORMATS }
  ],
  entryComponents: [DeleteDialog]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    // Forcing the whole app to use the returned providers from the AppModule only.
    return {
      ngModule: SharedModule,
      providers: [
        /* All of your services here. It will hold the services needed by `itself`. */
      ]
    };
  }
}
