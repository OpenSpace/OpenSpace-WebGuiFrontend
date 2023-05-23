// @flow

export function excludeKeys(value: Object, keys: string): Object {
  const doNotInclude = keys.split(' ');
  return Object.keys(value)
    // actually filter out the keywords
    .filter((key) => !doNotInclude.includes(key))
    // create new object to return
    .reduce((newObj, key) => {
      // eslint-disable-next-line no-param-reassign
      newObj[key] = value[key];
      return newObj;
    }, {});
}

/**
 * Run a function `func` after current call stack has been finished
 *
 * @param func - the function to call
 * @param args - the arguments to call with
 */
export function defer(func: Function, ...args: Array<mixed>): number {
  return setTimeout(() => func(...args), 0);
}

/**
 * rotate the positions in array arr
 * @param arr
 * @param steps - number of steps
 * @returns {Array.<any>}
 */
export function rotate(arr: Array<any>, steps: number): Array<any> {
  // make a shallow copy of the array
  const copy = arr.slice();
  const size = copy.length;
  copy.unshift(...copy.splice(steps % size, size));
  return copy;
}

export function openUrl(url) {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
}
