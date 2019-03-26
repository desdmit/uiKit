import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Observable, Subject } from 'rxjs';

export class CoreTableVirtualScrollStrategy implements VirtualScrollStrategy {
  public scrolledIndexChange: Observable<number>;

  private dataLength = 0;
  private readonly indexChange = new Subject<number>();
  private viewport: CdkVirtualScrollViewport;
  private offset = 0;

  constructor(private itemHeight: number, private headerOffset: number, private buffer = 15) {
    this.scrolledIndexChange = this.indexChange.asObservable();
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

    this.viewport.setTotalContentSize(this.dataLength * this.itemHeight + this.headerOffset);
  }

  public setDataLength(length: number): void {
    this.dataLength = length;
    this.onDataLengthChanged();
    this.updateContent();
  }

  public setScrollHeight(rowHeight: number, headerOffset: number) {
    const oldRowHeight = this.itemHeight;

    this.itemHeight = rowHeight;
    this.headerOffset = headerOffset;

    if (this.viewport) {
      const offset = this.viewport.measureScrollOffset();
      const skip = offset / oldRowHeight;

      this.onDataLengthChanged();
      this.updateContent();

      setTimeout(() => this.scrollToIndex(skip));
    }
  }

  public detach(): void {
    // add some unsubscribe actions here if required in the future
  }

  public onContentRendered(): void {
    // add some after rendering actions here if required in the future
  }

  public onRenderedOffsetChanged(): void {
    this.viewport.scrollToOffset(this.offset);
  }

  public scrollToIndex(index: number, behavior?: ScrollBehavior): void {
    this.viewport.scrollToOffset(index * this.itemHeight, behavior);
  }

  private updateContent(): void {
    if (!this.viewport) {
      return;
    }

    this.offset = this.viewport.measureScrollOffset();

    const viewportSize = this.viewport.getViewportSize();
    const amount = Math.ceil(viewportSize / this.itemHeight);
    const skip = Math.round(this.offset / this.itemHeight);
    const index = Math.max(0, skip);
    const start = Math.max(0, index - this.buffer);
    const end = Math.min(this.dataLength, index + amount + this.buffer);
    const contentOffset = this.itemHeight * start;

    this.viewport.setRenderedRange({ start, end });
    this.viewport.setRenderedContentOffset(contentOffset);
    this.indexChange.next(index);
  }
}
