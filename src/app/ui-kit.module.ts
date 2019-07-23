import { NgModule } from '@angular/core';
import { MatIconModule, MatIconRegistry, MatSortModule, MatTableModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UiKitComponent } from './ui-kit.component';
import { CoreTableModule } from './core-table/table/core-table.module';
import { WindowUtilities } from './utilities';
import { CoreTableFilterModule } from './core-table/filter/filter.module';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreTableModule,
    MatIconModule,
    CoreTableFilterModule,
    MatTableModule,
    MatSortModule,
  ],
  exports: [MatIconModule],
  declarations: [UiKitComponent],
  providers: [WindowUtilities],
  bootstrap: [UiKitComponent],
})
export class UiKitModule {
  constructor(iconRegistry: MatIconRegistry) {
    iconRegistry.registerFontClassAlias('fabric', 'ms-Icon-268');
  }
}
