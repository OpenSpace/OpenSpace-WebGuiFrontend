import { initializeShortcuts } from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

let topic;

const subscribeToShortcuts = (callback) => {
  topic = api.startTopic('shortcuts', {
    event: 'start_subscription'
  });
  (async () => {
    for await (const data of topic.iterator()) {
      callback(data);
    }
  })();
};

const unsubscribeToShortcuts = () => {
  if (!topic) {
    return;
  }
  topic.talk({
    event: 'stop_subscription'
  });
  topic.cancel();
};

const shortcuts = (store) => (next) => (action) => {
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
  case actionTypes.triggerAction:
    const actionName = action.payload;
    console.log(api);
    store.getState().luaApi.action.triggerAction(actionName);
    break;
  default:
    break;
  }
  return result;
};
export default shortcuts;
