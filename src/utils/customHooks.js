import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subscribeToProperty, unsubscribeToProperty } from '../api/Actions';
function useLocalStorageState(
  key,
  defaultValue = '',
  // the = {} fixes the error we would get from destructuring when no argument was passed
  // Check https://jacobparis.com/blog/destructure-arguments for a detailed explanation
  { serialize = JSON.stringify, deserialize = JSON.parse } = {},
) {
  const [state, setState] = React.useState(() => {
    const valueInLocalStorage = window.localStorage.getItem(key);
    if (valueInLocalStorage) {
      // the try/catch is here in case the localStorage value was set before
      // we had the serialization in place (like we do in previous extra credits)
      try {
        return deserialize(valueInLocalStorage);
      } catch (error) {
        window.localStorage.removeItem(key);
      }
    }
    return (typeof defaultValue === 'function') ? defaultValue() : defaultValue;
  });

  const prevKeyRef = React.useRef(key);

  // Check the example at src/examples/local-state-key-change.js to visualize a key change
  React.useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey);
    }
    prevKeyRef.current = key;
    window.localStorage.setItem(key, serialize(state));
  }, [key, state, serialize]);

  return [state, setState];
}

// Used to compare floating point values for selectors
function lowPrecisionEqual(oldValue, newValue) {
  const Precision = 1000;
  return Math.floor(oldValue * Precision) === Math.floor(newValue * Precision);
}

function useSubscribeToProperty(uri, comparisonFunc = (a, b) => a === b) {
  const propertyValue = useSelector((state) => {
    return state.propertyTree.properties[uri]?.value;
  }, comparisonFunc);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(subscribeToProperty(uri));
    return () => dispatch(unsubscribeToProperty(uri));
  }, [uri]);
  return propertyValue;
}

export { lowPrecisionEqual, useLocalStorageState, useSubscribeToProperty };
