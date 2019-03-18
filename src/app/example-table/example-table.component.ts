import {
  Component,
  Input,
  AfterViewInit,
  OnInit,
  Output,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { of, Subject, Observable } from 'rxjs';
import { delay, exhaustMap, filter, map, tap } from 'rxjs/operators';
import { MatPaginator, MatSort } from '@angular/material';
import { CoreTableMenuComponent } from '../core-table/menu/menu.component';
import { CoreTableFilterComponent } from '../core-table/filter/filter.component';
import { CoreTableDataSource } from '../core-table/data-source';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { IDocument } from '../inventory/docoments';
import { size } from '../utilities/window';

@Component({
  selector: 'my-example-table',
  templateUrl: './example-table.component.html',
  styleUrls: ['./example-table.component.scss'],
})
export class ExampleTableComponent implements AfterViewInit, OnInit {
  @Input() public getData: (page: number, count: number) => Observable<IDocument[]>;
  @Input() public pageSize = 50;

  /*@Input()
  set items(data: Example[]) {
    this.init();
    this.dataSource.allData = data;
    this.data = data;
  }

  private data: Example[];*/

  @Input() public sticky: boolean;
  public pending: boolean;
  @Output() public select = new Subject<IDocument[]>();
  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(CdkVirtualScrollViewport) public viewport: CdkVirtualScrollViewport;
  @ViewChild(CoreTableMenuComponent) public tableMenu: CoreTableMenuComponent;
  @ViewChildren(CoreTableFilterComponent) public filters: QueryList<CoreTableFilterComponent>;

  public offset: number;
  public rowHeight = 27;
  public dataSource: CoreTableDataSource<IDocument>;
  public columns: string[] = [
    'id',
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
    // 'menu',
  ];

  get indeterminate(): boolean {
    return this.dataSource.selected.length > 0 && !this.selectedAll;
  }

  get length(): number {
    return this.dataSource.data.length;
  }

  get selectedAll(): boolean {
    return this.dataSource.selectedAll;
  }

  public ngOnInit() {
    this.init();

    size.subscribe(({ isNarrow }) => {
      this.rowHeight = isNarrow ? 70 : 27;
      console.log(this.rowHeight);
    });
  }

  public ngAfterViewInit() {
    if (this.filters.length && this.tableMenu == undefined) {
      // this just hides the table data by introducing a bogus filter.
      // not having a clear filters button hopefully makes the error obvious.
      this.dataSource.setFilter({ key: '', predicate: () => undefined, valueFn: () => undefined });
      // this notifies the error to the dev
      throw new Error(
        `<core-table-filter> usage requires a <core-table-menu> for user convenience`,
      );
    }
  }

  private hasObservers(subject: Subject<any>): boolean {
    return subject.observers.length > 0;
  }

  private init() {
    if (this.dataSource) {
      return;
    }

    if (this.hasObservers(this.select)) {
      this.columns = ['select', ...this.columns];
    }

    this.dataSource = new CoreTableDataSource([], {
      sort: this.sort,
      paginator: this.paginator,
      viewport: this.viewport,
    });

    this.dataSource.selectionChanged.subscribe(() => this.select.next(this.dataSource.selected));

    this.viewport.scrolledIndexChange.subscribe(() => {
      this.offset = -this.viewport.getOffsetToRenderedContentStart();
    });

    this.getData(0, this.pageSize).subscribe(data => {
      this.dataSource.allData = data;
    });

    const buffer = 20;
    this.viewport.renderedRangeStream
      .pipe(
        map(({ end }) => {
          return { end, data: this.dataSource.allData };
        }),
        filter(({ end, data }) => end + buffer > data.length),
        tap(() => (this.pending = true)),
        exhaustMap(({ data }) =>
          this.getData(data.length / this.pageSize, this.pageSize).pipe(
            map(value => [...data, ...value]),
          ),
        ),
      )
      .subscribe(data => {
        this.dataSource.allData = data;
        this.pending = false;
      });
  }

  public clearFilters(): void {
    this.dataSource.clearFilters();
    this.filters.forEach(fc => fc.filter.setValue(undefined));
  }

  public clearSelection(): void {
    this.dataSource.clearSelection();
  }

  public filter(
    key: string,
    predicate: (value: any) => boolean,
    valueFn: (item: IDocument) => any,
  ): void {
    const tableFilter = { key, predicate, valueFn };
    this.dataSource.setFilter(tableFilter);
  }

  public isSelected(item: IDocument): boolean {
    return this.dataSource.isSelected(item);
  }

  public toggle(item: IDocument): void {
    this.dataSource.toggle(item);
  }

  public toggleAll(): void {
    this.dataSource.toggleAll();
  }
}
