import {
  Component,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewChildren,
  QueryList,
  ContentChildren,
  AfterContentInit,
  ViewContainerRef,
  ChangeDetectorRef,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { Subject, Observable } from 'rxjs';
import {
  exhaustMap,
  filter,
  map,
  tap,
  distinctUntilChanged,
  startWith,
  takeUntil,
  debounceTime,
} from 'rxjs/operators';
import { MatColumnDef, MatSort, MatTable } from '@angular/material';
import { CoreTableFilterComponent } from '../filter/filter.component';
import { CoreTableDataSource } from '../data-source';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { mean } from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'core-table',
  templateUrl: './core-table.component.html',
  styleUrls: ['./core-table.component.scss'],
})
export class CoreTableComponent<T> implements OnInit, AfterContentInit, OnDestroy {
  @Input() public getData: (page: number, count: number) => Observable<T[]>;
  @Input() public pageSize = 50;
  @Input() public buffer = 5;
  @Input() public sticky: boolean;
  @Input() public columns: string[];
  @Input() public multiSelect = true;
  @Output() public select = new EventEmitter<T[]>();

  @ViewChild(MatTable) private table: MatTable<T>;
  @ContentChildren(MatColumnDef) private columnsDef: QueryList<MatColumnDef>;

  @Input() public sort: MatSort;
  @ViewChild(CdkVirtualScrollViewport) public viewport: CdkVirtualScrollViewport;
  @ViewChildren(CoreTableFilterComponent) public filters: QueryList<CoreTableFilterComponent>;

  @ViewChildren('row', { read: ViewContainerRef }) private rowsRef: QueryList<ViewContainerRef>;
  @ViewChild('headerRow', { read: ViewContainerRef }) private headerRowRef: ViewContainerRef;

  public columnsToDisplay: string[] = [];
  public pending: boolean;
  public offset: number;
  public dataSource: CoreTableDataSource<T>;
  public selection: SelectionModel<T>;
  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(private cd: ChangeDetectorRef) {}

  public ngOnInit() {
    if (this.dataSource) {
      return;
    }

    this.initColumns();

    this.dataSource = new CoreTableDataSource([{}], {
      sort: this.sort,
      viewport: this.viewport,
    });

    this.selection = new SelectionModel<T>(this.multiSelect);
    this.selection.changed
      .pipe(
        debounceTime(100),
        map(() => this.selection.selected),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe(this.select);

    this.viewport.scrolledIndexChange
      .pipe(
        map(() => this.viewport.getOffsetToRenderedContentStart()),
        distinctUntilChanged(),
      )
      .subscribe(val => (this.offset = val));

    this.viewport.renderedRangeStream
      .pipe(
        startWith({ end: 0 }),
        map(({ end }) => ({ end, data: this.dataSource.data })),
        filter<{ end: number; data: T[] }>(({ end, data }) => end + this.buffer > data.length),
        tap(() => (this.pending = true)),
        exhaustMap(({ data }) => {
          return this.getData((data.length - 1) / this.pageSize, this.pageSize).pipe(
            map(value => [...data, ...value]),
          );
        }),
      )
      .subscribe(data => {
        this.dataSource.data = data;
        this.pending = false;
      });
  }

  public ngAfterContentInit() {
    this.columnsDef.forEach(columnDef => this.table.addColumnDef(columnDef));
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public getRowHeight = () =>
    mean(this.rowsRef && this.rowsRef.map(({ element }) => element.nativeElement.offsetHeight));

  public offsetRowWhen = (index: number) => index === 0;

  private initColumns() {
    const columns = [...this.columns, 'menu'];

    if (this.hasObservers(this.select)) {
      columns.unshift('select');
    }

    this.columnsToDisplay = columns;
  }

  private hasObservers = (subject: Subject<any>): boolean => subject.observers.length > 0;

  public isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  public masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  public changeSelection(event, item: T) {
    this.selection.toggle(item);
    this.cd.detectChanges();
  }

  public clearFilters(): void {
    this.dataSource.clearFilters();
    this.filters.forEach(fc => fc.filter.setValue(undefined));
  }
}
