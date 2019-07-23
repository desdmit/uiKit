import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  ContentChild,
  Directive,
  forwardRef,
  Input,
  OnDestroy,
} from '@angular/core';
import { MatTable } from '@angular/material';
import { Subscription } from 'rxjs';
import { CoreTableDataSource } from '../data-source/data-source';
import { CoreTableVirtualScrollStrategy } from './virtual-scroll.strategy';

@Directive({
  selector: 'cdk-virtual-scroll-viewport[coreTableVirtualScroll]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: (scroll: CoreTableFixedVirtualScrollDirective) => scroll.scrollStrategy,
      deps: [forwardRef(() => CoreTableFixedVirtualScrollDirective)],
    },
  ],
})
export class CoreTableFixedVirtualScrollDirective implements AfterViewInit, OnDestroy {
  @Input() public getRowHeight: () => number;
  @Input() public getHeaderOffset: () => number;

  @ContentChild(MatTable) public table: MatTable<any>;

  private defaultRowHeight = 27;
  private defaultOffset = 0;

  public scrollStrategy: CoreTableVirtualScrollStrategy;

  private sub: Subscription;

  private rowHeight = () => (this.getRowHeight && this.getRowHeight()) || this.defaultRowHeight;
  private offset = () => (this.getHeaderOffset && this.getHeaderOffset()) || this.defaultOffset;

  constructor() {
    this.scrollStrategy = new CoreTableVirtualScrollStrategy(this.rowHeight, this.offset);
  }

  public ngAfterViewInit() {
    if (this.table.dataSource instanceof CoreTableDataSource) {
      this.sub = this.table.dataSource.filteredData.subscribe(data => {
        this.scrollStrategy.setDataLength(data.length);
      });
    }
  }

  public ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
