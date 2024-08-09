import {
  initializeLuaApi,
  onCloseConnection,
  onOpenConnection
} from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

let openspace;

function initializeConnection(store) {
  async function onConnect() {
    openspace = await api.library();

    store.dispatch(onOpenConnection());
    store.dispatch(initializeLuaApi(openspace));
  }

  function onDisconnect() {
    store.dispatch(onCloseConnection());

    let reconnectionInterval = 1000;
    setTimeout(() => {
      api.connect();
      reconnectionInterval += 1000;
    }, reconnectionInterval);
  }

  api.onConnect(onConnect);
  api.onDisconnect(onDisconnect);
  api.connect();
}

const connection = (store) => (next) => (action) => {
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
export default connection;
