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

export function stopEventPropagation(e) {
  e.cancelBubble = true;
  if (e.stopPropagation) e.stopPropagation();
  if (!e) {
    const { event } = window;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();
  }
}

/**
 * Copy a text to the clipboard
 * @param text - text to copy
 */
export function copyTextToClipboard(text) {
  // Note: Implementation is kind of ugly, but works with CEF.
  // (The preferred "navigator.clipboard.writeText" only works over https)
  const textArea = document.createElement('textarea');
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  textArea.style.width = '2em';
  textArea.style.height = '2em';

  textArea.style.padding = 0;

  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  textArea.value = text;

  document.body.appendChild(textArea);

  textArea.select();
  document.execCommand('copy');

  document.body.removeChild(textArea);
}
