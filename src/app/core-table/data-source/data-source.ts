import { DataSource, SelectionChange, SelectionModel } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatPaginator, MatSort, Sort } from '@angular/material';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay, startWith, tap } from 'rxjs/operators';
import { CoreTableFilter } from '../filter/filter';
import { HashMap } from '../../utilities/index';
import { sortBy } from '../../utilities/reactive';

interface IDataSourceInit {
  sort?: MatSort;
  paginator?: MatPaginator;
  viewport?: CdkVirtualScrollViewport;
}

/**
 * `DataSource` to be used with `CoreTable` and `MatTable`.
 *
 * Supports advanced filtering, sorting, pagination and virtual scroll.
 */
export class CoreTableDataSource<T> extends DataSource<T> {
  private readonly filteredDataInfo = new BehaviorSubject<T[]>([]);
  private filterMap: HashMap<CoreTableFilter<T>> = {};
  private readonly selection = new SelectionModel<T>(true, []);
  private readonly visibleData: Observable<T[]>;
  private allDataInfo: T[];

  /**
   * A stream of the filtered arrays of data
   */
  public readonly filteredData: Observable<T[]>;

  /**
   * The full array of data
   */
  get allData(): T[] {
    return this.allDataInfo.slice();
  }
  set allData(data: T[]) {
    this.allDataInfo = data;
    this.filter(data, this.filterMap);
  }

  /**
   * The array of visible data (being rendered)
   */
  get data(): T[] {
    let data: T[];
    this.visibleData.subscribe(d => (data = d)).unsubscribe();

    return data;
  }

  /**
   * The array of currently applied `CoreTableFilter`.
   */
  get filters(): CoreTableFilter<T>[] {
    return Object.values({ ...this.filterMap });
  }

  /**
   * The array of currently selected items.
   */
  get selected(): T[] {
    return this.selection.selected;
  }

  /**
   * Whether all visible items are selected.
   */
  get selectedAll(): boolean {
    return this.selection.hasValue() && this.selected.length === this.allDataInfo.length;
  }

  /**
   * A stream of changes made on selections.
   */
  get selectionChanged(): Observable<SelectionChange<T>> {
    return this.selection.changed;
  }

  constructor(initialData: T[], { sort, paginator, viewport }: IDataSourceInit = {}) {
    super();
    this.allDataInfo = initialData;
    this.filteredData = this.filteredDataInfo.asObservable();
    this.filteredDataInfo.next(initialData);

    const ordered = !sort
      ? this.filteredDataInfo
      : combineLatest(this.filteredDataInfo, sort.sortChange.pipe(startWith({}))).pipe(
          map<[T[], Sort], T[]>(([data, { active, direction }]) =>
            !active || !direction
              ? data
              : sortBy<T>(t => getProperty(t, active), {
                  reverse: direction === 'desc',
                })(data),
          ),
        );

    const paged = !paginator
      ? ordered
      : combineLatest(ordered, paginator.page).pipe(
          map(([data]) => data),
          tap(data => {
            paginator.length = data.length;
          }),
          map(data => {
            const start = paginator.pageIndex * paginator.pageSize;
            return data.slice(start, start + paginator.pageSize);
          }),
        );

    const sliced = !viewport
      ? paged
      : combineLatest(paged, viewport.renderedRangeStream).pipe(
          map(([data, { start, end }]) => data.slice(start, end)),
        );

    this.visibleData = sliced.pipe(shareReplay(1));
  }

  /**
   * Clears all filters set with `setFilter`.
   */
  public clearFilters(): void {
    this.filterMap = {};
    this.filteredDataInfo.next(this.allData);
  }

  /**
   * Clears all of the selected items.
   */
  public clearSelection(): void {
    this.selection.clear();
  }

  /**
   * Whether an item is selected.
   */
  public isSelected(item: T): boolean {
    return this.selection.isSelected(item);
  }

  /**
   * Selects one or more items.
   */
  public select(...items: T[]): void {
    this.selection.select(...items);
  }

  /**
   * Sets a new `CoreTableFilter` based on its key
   * and applies all existing filters to the `DataSource`.
   * @param key Unique key, usually representing the property path to retrieve a value from an item.
   * @param predicate How to filter the values extracted by `key`, like `Array.prototype.filter`.
   * @param valueFn Optional function to extract a value from each item.
   *
   * Default: `item => item[key]`.
   *
   * Note: Supports nested property paths, e.g. `'my.nested.prop'`
   *
   * @example
   * const dataSource = new CoreTableDataSource([1, 2, 3, 4]);
   * dataSource.setFilter({
   *   key: 'prop',
   *   predicate: value => value % 2
   * });
   * console.log(dataSource.data);
   * // [2, 4]
   *
   * dataSource.setFilter({
   *   key: 'propPlusOne',
   *   predicate: value => value % 2,
   *   valueFn: item => item + 1
   * });
   * console.log(dataSource.data);
   * // [1, 3]
   */
  public setFilter({
    key,
    predicate,
    valueFn = (item: T) => getProperty(item, key),
  }: CoreTableFilter<T>): void {
    const newKey = !this.filterMap[key];
    const newFilter = { key, predicate, valueFn };
    this.filterMap[key] = newFilter;

    newKey
      ? this.filter(this.filteredDataInfo.value, { [key]: newFilter })
      : this.filter(this.allData, this.filterMap);
  }

  /**
   * Toggles an item between selected and deselected.
   */
  public toggle(item: T): void {
    this.selection.toggle(item);
  }

  /**
   * Toggles the selection of all visible items.
   *
   * If all are selected, deselects all.
   *
   * If some or none are selected, selects all.
   */
  public toggleAll(): void {
    this.selectedAll ? this.selection.clear() : this.selection.select(...this.allDataInfo);
  }

  public connect() {
    return this.visibleData;
  }

  public disconnect() {
    // add some unsubscribe actions here if required in the future
  }

  private filter(data: T[], filters: HashMap<CoreTableFilter<T>>): void {
    this.filteredDataInfo.next((data || []).filter((t: T) => filterOne(t, filters)));
  }
}

function filterOne<T>(item: T, filters: HashMap<CoreTableFilter<T>>) {
  return Object.values(filters).every(({ predicate, valueFn }) => predicate(valueFn(item)));
}

function getProperty<T>(item: T, propertyPath: string): string {
  return propertyPath.split('.').reduce((obj, prop) => obj && obj[prop], item);
}
