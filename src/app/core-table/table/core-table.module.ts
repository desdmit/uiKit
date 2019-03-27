import { NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  MatCheckboxModule,
  MatProgressBarModule,
  MatSortModule,
  MatTableModule,
  MatIconModule,
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { CoreTableFilterModule } from '../filter/filter.module';
import { CoreTableMenuModule } from '../menu/menu.module';
import { CoreTableVirtualScrollModule } from '../virtual-scroll/virtual-scroll.module';
import { CoreTableComponent } from './core-table.component';
import { CoreTableColumnComponent } from './core-table-column.component';
import { CdkTableModule } from '@angular/cdk/table';

const components = [CoreTableComponent, CoreTableColumnComponent];

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
    CdkTableModule,
    ScrollingModule,
    MatIconModule,
  ],
})
export class CoreTableModule {}
