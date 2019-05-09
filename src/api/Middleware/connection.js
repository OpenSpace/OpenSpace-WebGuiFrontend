import {
  onOpenConnection,
  initializeLuaApi,
  onCloseConnection,
  subscribeToShortcuts
} from '../Actions';

import { actionTypes } from '../Actions/actionTypes';
import api from '../api';

let openspace = undefined;

function initializeConnection(store) {
  async function onConnect() {
    openspace = await api.library();

    store.dispatch(onOpenConnection());
    store.dispatch(initializeLuaApi(openspace));
  }

  function onDisconnect() {
    store.dispatch(onCloseConnection());

    let reconnectionInterval = 1000;
    console.log('Attempting to connect in', connection.connectionWait, 'ms.'); // eslint-disable-line
    setTimeout(() => {
      api.connect();
      reconnectionInterval *= 2;
    }, reconnectionInterval);
  }

  api.onConnect(onConnect);
  api.onDisconnect(onDisconnect);
  api.connect();
}

export const connection = store => next => action => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.startConnection:
      initializeConnection(store);
      break;
    default:
      break;
  }
  return result;
};
