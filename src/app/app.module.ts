import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TableModule } from 'primeng/table';

import { AppComponent } from './app.component';
import { TableComponent } from './table/table.component';
import { TablePComponent } from './primeTable/table.component';
import { TableFixedSizeVirtualScroll } from './table/table-vs-strategy.service';

@NgModule({
  imports:      [ BrowserModule, FormsModule, ScrollingModule, MatTableModule, TableModule ],
  declarations: [ AppComponent, TableComponent, TableFixedSizeVirtualScroll, TablePComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
