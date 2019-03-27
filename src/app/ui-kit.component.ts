import { Component } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { getData } from './inventory/docoments';

@Component({
  selector: 'my-app',
  templateUrl: './ui-kit.component.html',
  styleUrls: ['./ui-kit.component.scss'],
})
export class UiKitComponent {
  public delay = 2000;
  public getData = (page: number, size: number) => of(getData(page, size)).pipe(delay(this.delay));
  public sticky = true;
  public columns = [
    'type',
    'narrow',
    'name',
    'fileName',
    'object',
    'objectName',
    'state',
    'createdBy',
    'changedBy',
    'changeDate',
    'actions',
    'menu',
  ];
}
