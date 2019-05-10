import {
    subscribeToProperty,
    unsubscribeToProperty,
    setPropertyValue
  } from './Actions';


export default function propertyDispatcher(dispatch, uri) {
  return {
    subscribe: () => dispatch(subscribeToProperty(uri)),
    unsubscribe: () => dispatch(unsubscribeToProperty(uri)),
    set: (value) => dispatch(setPropertyValue(uri, value))
  }
}
