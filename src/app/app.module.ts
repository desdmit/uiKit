import { NgModule } from '@angular/core';
import { MatButtonModule, MatCheckboxModule, MatIconModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ExampleTableModule } from './example-table/example-table.module';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ExampleTableModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  exports: [MatIconModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
