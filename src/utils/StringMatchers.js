// @flow

/**
 * Check if search is a substring of test
 * @param test - string to match against
 * @param search - string to match with
 * @constructor
 */
export const SimpleSubstring = (test: string, search: string): bool => {
  return test.includes(search);
}

export const CaseInsensitiveSubstring = (test: string, search: string): bool => {
  const lowerCaseTest = test.toLowerCase();
  const lowerCaseSearch = search.toLowerCase();
  return lowerCaseTest.includes(lowerCaseSearch);
};

export const WordBeginningSubstring = (test: string, search: string): bool => {
  const searchWords = search.split(' ');
  const testWords = test.split(' ');
  return searchWords.every(searchWord =>
    testWords.some(testWord => testWord.indexOf(searchWord) === 0)
  );
};

/**
 * Check if object has any values which has search as substring
 * @param test - object to match against
 * @param search - string to match with
 * @constructor
 */
export const ObjectSimpleSubstring = (test: object, search: string): bool => {
  const valuesAsStrings = Object.values(test)
    .filter(t => ['number', 'string'].includes(typeof t))
    .map(t => t.toString())
    .map(t => t.toLowerCase());
  return valuesAsStrings.some(v => SimpleSubstring(v, search));
};

export const ObjectWordBeginningSubstring = (test: object, search: string): bool => {
  const valuesAsStrings = Object.values(test)
    .filter(t => ['number', 'string'].includes(typeof t))
    .map(t => t.toString())
    .map(t => t.toLowerCase());
  return valuesAsStrings.some(v => WordBeginningSubstring(v, search));
};

/**
 * Check if search is a substring of any of the strings in the list
 * @param test - string list to match against
 * @param search - string to match with
 * @constructor
 */
export const ListCaseInsensitiveSubstring = (test: string[], search: string): bool => {
  const lowerCaseTest = test.map(t => t.toLowerCase());
  const lowerCaseSearch = search.toLowerCase();
  return lowerCaseTest.some(v => v.includes(lowerCaseSearch));
};
