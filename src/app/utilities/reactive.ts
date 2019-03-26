import { UnaryFunction } from 'rxjs';

/**
 * Returns a function that opposes values returned by the specified function.
 *
 * note: opposite means multiplying numbers by -1.
 */
export function opposite<T>(fn: (...source: T[]) => any): UnaryFunction<T, number> {
  return (...args) => fn(...args) * -1;
}

/**
 * Returns an `Operator` that sorts the array according to a specified compare function
 * @param compareFn Function that compares two values (`a` and `b`).
 * Return `1` for `a -> b`, or `-1` for `b -> a`, or `0` for no change.
 *
 * Default: `Array.prototype.sort`
 */
export function sort<T>(compareFn?: (a: T, b: T) => number): UnaryFunction<T[], T[]> {
  return source => source.slice().sort(compareFn);
}

/**
 * Returns an `Operator` that sorts the array according to the values extracted by
 * a specified function.
 * @param mapFn Function that extracts a value from each `T`.
 * @param options Optionally determine whether to sort in reverse (descending).
 */
export function sortBy<T>(
  mapFn: (item: T) => any,
  options = { reverse: false },
): UnaryFunction<T[], T[]> {
  return sort(!options.reverse ? sortByFn(mapFn) : opposite(sortByFn(mapFn)));
}

function sortByFn<T>(mapFn: (item: T) => any): (itemA: T, itemB: T) => number {
  return (itemA: T, itemB: T) => {
    const valueA = mapFn(itemA);
    const valueB = mapFn(itemB);

    return typeof valueA === 'string'
      ? compareString(valueA, valueB)
      : compareValue(valueA, valueB);
  };
}

/*tslint:disable:triple-equals*/
function compareValue(a: any, b: any): 0 | 1 | -1 {
  if (a == undefined) {
    return b == undefined ? 0 : -1;
  }
  if (b == undefined || a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }

  return 0;
}
/*tslint:enable*/

function compareString(a: string, b: any): number {
  return a.localeCompare(b);
}
