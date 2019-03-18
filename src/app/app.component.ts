import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, startWith } from 'rxjs/operators';
import { getData, IDocument } from './inventory/docoments';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public delay = 2000;
  public getData: (page: number, count: number) => Observable<IDocument[]>;
  public sticky = true;

  constructor() {
    this.fetch();
  }

  public fetch() {
    this.getData = (page: number, size: number) =>
      of(getData(page, size)).pipe(
        delay(this.delay),
        startWith([]),
      );
  }
}
