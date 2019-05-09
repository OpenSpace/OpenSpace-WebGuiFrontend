import {
    startListening,
    stopListening,
    changePropertyValue
  } from './Actions';


export default function propertyDispatcher(dispatch, uri) {
  return {
    subscribe: () => dispatch(startListening(uri)),
    unsubscribe: () => dispatch(stopListening(uri)),
    set: (value) => dispatch(changePropertyValue(uri, value))
  }
}
