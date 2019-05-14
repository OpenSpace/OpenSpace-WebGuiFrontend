// @flow

/**
 * Check if search is a substring of test
 * @param test - string to match against
 * @param search - string to match with
 * @constructor
 */
export const SimpleSubstring = (test: string, search: string): bool =>
  test.includes(search);


/**
 * Check if object has any values which has search as substring
 * @param test - object to match against
 * @param search - string to match with
 * @constructor
 */
export const ObjectSubstring = (test: object, search: string): bool => {
  const valuesAsStrings = Object.values(test)
    .filter(t => ['number', 'string'].includes(typeof t))
    .map(t => t.toString())
    .map(t => t.toLowerCase());
  return valuesAsStrings.some(test => SimpleSubstring(test, search));
};