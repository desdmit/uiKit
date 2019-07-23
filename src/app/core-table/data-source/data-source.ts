import { DataSource, ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatSort, Sort } from '@angular/material';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { CoreTableFilter } from '../filter/filter';
import { HashMap } from '../../utilities/index';
import { sortBy } from '../../utilities/reactive';

interface IDataSourceInit {
  sort?: MatSort;
  viewport?: CdkVirtualScrollViewport;
}

export class CoreTableDataSource<T> extends DataSource<T> {
  private readonly filteredDataInfo = new BehaviorSubject<T[]>([]);
  private filterMap: HashMap<CoreTableFilter<T>> = {};
  private readonly visibleData: Observable<T[]>;
  private allDataInfo: T[];

  /**
   * A stream of the filtered arrays of data
   */
  public readonly filteredData: Observable<T[]>;

  get data(): T[] {
    return this.allDataInfo.slice();
  }
  set data(data: T[]) {
    this.allDataInfo = data;
    this.filter(data, this.filterMap);
  }

  /**
   * The array of currently applied `CoreTableFilter`.
   */
  get filters(): CoreTableFilter<T>[] {
    return Object.values({ ...this.filterMap });
  }

  constructor(initialData: T[], { sort, viewport }: IDataSourceInit = {}) {
    super();
    this.allDataInfo = initialData;
    this.filteredData = this.filteredDataInfo.asObservable();
    this.filteredDataInfo.next(initialData);

    const ordered = !sort
      ? this.filteredDataInfo
      : combineLatest<[T[], Sort]>(this.filteredDataInfo, sort.sortChange.pipe(startWith({}))).pipe(
          map(([data, { active, direction }]) =>
            !active || !direction
              ? data
              : sortBy<T>(t => getProperty(t, active), {
                  reverse: direction === 'desc',
                })(data),
          ),
        );

    const sliced = !viewport
      ? ordered
      : combineLatest<[T[], ListRange]>(ordered, viewport.renderedRangeStream).pipe(
          map(([data, { start, end }]) => data.slice(start, end)),
        );

    this.visibleData = sliced.pipe(shareReplay(1));
  }

  /**
   * Clears all filters set with `setFilter`.
   */
  public clearFilters(): void {
    this.filterMap = {};
    this.filteredDataInfo.next(this.data);
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
      : this.filter(this.data, this.filterMap);
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
