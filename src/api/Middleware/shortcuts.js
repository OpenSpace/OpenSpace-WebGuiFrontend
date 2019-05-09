import { initializeShortcuts } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';

let topic = -1;

const subscribeToShortcuts = callback => {
/*  topic = DataManager.subscribeToShortcuts((data) => {
    callback(data);
  })*/
};

const unsubscribeToShortcuts = () => {
  /*if (topic !== -1) {
    DataManager.unsubscribeToShortcuts(topic);
  }*/
}

export const shortcuts = store => next => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.onOpenConnection:
      subscribeToShortcuts((data) => {
        store.dispatch(initializeShortcuts(data));
      });
      break;
    case actionTypes.onCloseConnection:
      unsubscribeToShortcuts();
      break;
    default:
      break;
  }
  return result;
};
