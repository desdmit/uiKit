import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { fromEvent, Observable, Subject, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

export class CoreTableVirtualScrollStrategy implements VirtualScrollStrategy {
  public scrolledIndexChange: Observable<number>;

  private dataLength = 0;
  private readonly indexChange = new Subject<number>();
  private viewport: CdkVirtualScrollViewport;
  private offset = 0;
  private prevOffset = 0;
  private prevRowHeight;
  private resizeSub: Subscription;

  constructor(
    private getRowHeight: () => number,
    private getHeaderOffset?: () => number,
    private buffer = 15,
  ) {
    this.scrolledIndexChange = this.indexChange.asObservable();

    this.resizeSub = fromEvent(window, 'resize')
      .pipe(startWith(undefined))
      .subscribe(() => {
        this.onDataLengthChanged();
        this.updateContent();
      });
  }

  public attach(viewport: CdkVirtualScrollViewport): void {
    this.viewport = viewport;
    this.onDataLengthChanged();
    this.updateContent();
  }

  public onContentScrolled(): void {
    this.updateContent();
  }

  public onDataLengthChanged(): void {
    if (!this.viewport) {
      return;
    }

    const contentSize = this.dataLength * this.getRowHeight() + this.getHeaderOffset();
    this.viewport.setTotalContentSize(contentSize);
  }

  public setDataLength(length: number): void {
    this.dataLength = length;
    this.onDataLengthChanged();
    this.updateContent();
  }

  public detach(): void {
    this.resizeSub.unsubscribe();
    this.indexChange.complete();
  }

  public onContentRendered(): void {
    // add some after rendering actions here if required in the future
  }

  public onRenderedOffsetChanged(): void {
    this.viewport.scrollToOffset(this.offset);
  }

  public scrollToIndex(index: number, behavior?: ScrollBehavior): void {
    this.viewport.scrollToOffset(index * this.getRowHeight(), behavior);
  }

  private scrollToNewPosition(offset: number, rowHeight: number) {
    const skip = offset / rowHeight;

    this.onDataLengthChanged();
    this.scrollToIndex(skip);
    setTimeout(() => this.scrollToIndex(skip));
  }

  private updateContent(): void {
    if (!this.viewport) {
      return;
    }

    const itemHeight = this.getRowHeight();

    if (this.prevRowHeight !== itemHeight) {
      this.scrollToNewPosition(this.prevOffset, this.prevRowHeight);
    }

    this.prevRowHeight = itemHeight;
    this.prevOffset = this.offset;
    this.offset = this.viewport.measureScrollOffset();

    const viewportSize = this.viewport.getViewportSize();
    const amount = Math.ceil(viewportSize / itemHeight);
    const skip = Math.round(this.offset / itemHeight);
    const index = Math.max(0, skip);
    const start = Math.max(0, index - this.buffer);
    const end = Math.min(this.dataLength, index + amount + this.buffer);
    const contentOffset = itemHeight * start;

    this.indexChange.next(index);

    this.viewport.setRenderedRange({ start, end });
    this.viewport.setRenderedContentOffset(contentOffset);
  }
}
