import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

window.addEventListener('resize', () => {});

export interface IWindowSize {
  isNarrow: boolean;
  width: number;
}

const sizeInfo = new BehaviorSubject<IWindowSize>({
  width: window.innerWidth,
  isNarrow: window.innerWidth <= 600,
});

fromEvent(window, 'resize')
  .pipe(
    map(({ target }) => ({
      width: window.innerWidth,
      isNarrow: window.innerWidth <= 600,
    })),
  )
  .subscribe(data => sizeInfo.next(data));

export const size = sizeInfo.asObservable();

export class WindowUtility {
  private static sizeInfo = new BehaviorSubject<IWindowSize>({
    width: window.innerWidth,
    isNarrow: window.innerWidth <= 600,
  });

  // public static size = this.sizeInfo.asObservable();

  public static isPortrait() {
    return window.matchMedia('(max-aspect-ratio: 5/4)').matches;
  }

  public static isNarrowView() {
    return window.matchMedia('(max-width: 600px)').matches;
  }
}
