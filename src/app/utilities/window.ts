import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { fromEvent } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/internal/operators';
import { Injectable } from '@angular/core';

export interface IWindowSize {
  isNarrow: boolean;
  width: number;
}

type WindowsSizeType = () => IWindowSize;

@Injectable()
export class WindowUtilities {
  private sizeInfo = new BehaviorSubject<IWindowSize>(this.getWindowsSizeInfo());
  public size = this.sizeInfo.asObservable().pipe(distinctUntilChanged());

  private getWindowsSizeInfo(): IWindowSize {
    return {
      width: window.innerWidth,
      isNarrow: window.innerWidth <= 600,
    };
  }

  constructor() {
    fromEvent(window, 'resize')
      .pipe(map(() => this.getWindowsSizeInfo()))
      .subscribe(data => this.sizeInfo.next(data));
  }
}
