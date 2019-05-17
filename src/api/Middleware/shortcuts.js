import { initializeShortcuts } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';

import api from '../api';

let topic = undefined;

const subscribeToShortcuts = callback => {
  topic = api.startTopic('shortcuts', {
    event: 'start_subscription',
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
    case actionTypes.executeShortcut:
      const index = action.payload;
      const shortcut = store.getState().shortcuts.data.shortcuts[index];
      const script = shortcut.script;
      api.executeLuaScript(script, false);
      break;
    break;
    default:
      break;
  }
  return result;
};
