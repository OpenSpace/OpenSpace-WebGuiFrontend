import { throttle } from 'lodash/function';

import {
  setPropertyValue,
  subscribeToProperty,
  unsubscribeToProperty
} from './Actions';

const ThrottleMs = 1000 / 60;

export default function propertyDispatcher(dispatch, uri) {
  const set = (value) => {
    dispatch(setPropertyValue(uri, value));
  };
  return {
    subscribe: () => dispatch(subscribeToProperty(uri)),
    unsubscribe: () => dispatch(unsubscribeToProperty(uri)),
    set: throttle(set, ThrottleMs)
  };
}
