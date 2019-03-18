import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  ContentChild,
  Directive,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { MatTable } from '@angular/material';
import { Subscription } from 'rxjs';
import { CoreTableDataSource } from '../data-source';
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
export class CoreTableFixedVirtualScrollDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input() public rowHeight = 48;
  @Input() public offset = 57;

  @ContentChild(MatTable) public table: MatTable<any>;

  public scrollStrategy: CoreTableVirtualScrollStrategy;

  private sub: Subscription;

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

  public ngOnChanges() {
    this.scrollStrategy.setScrollHeight(this.rowHeight, this.offset);
  }

  public ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
