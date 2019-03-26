import { NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  MatCheckboxModule,
  MatProgressBarModule,
  MatSortModule,
  MatTableModule,
  MatIconModule,
  MatIconRegistry,
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { CoreTableFilterModule } from '../filter/filter.module';
import { CoreTableMenuModule } from '../menu/menu.module';
import { CoreTableVirtualScrollModule } from '../virtual-scroll/virtual-scroll.module';
import { CoreTableComponent } from './core-table.component';

const components = [CoreTableComponent];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    BrowserModule,
    CoreTableFilterModule,
    CoreTableMenuModule,
    CoreTableVirtualScrollModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableModule,
    ScrollingModule,
    MatIconModule,
  ],
})
export class CoreTableModule {
  /*constructor(iconRegistry: MatIconRegistry) {
    iconRegistry.registerFontClassAlias('fabric', 'ms-Icon-268');
  }*/
}
