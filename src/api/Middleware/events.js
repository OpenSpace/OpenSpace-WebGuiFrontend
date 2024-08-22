import {
  addUriToPropertyTree,
  getAction,
  getCustomGroupsOrdering,
  refreshGroups,
  removeAction,
  removePropertyOwners
} from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

let eventTopic;
const nSubscribers = 0;

async function handleData(store, data) {
  switch (data.Event) {
    case 'PropertyTreeUpdated':
      store.dispatch(addUriToPropertyTree({ uri: data.Uri }));
      break;
    case 'PropertyTreePruned':
      store.dispatch(removePropertyOwners({ uris: [data.Uri] }));
      store.dispatch(refreshGroups());
      break;
    case 'ActionAdded':
      store.dispatch(getAction({ uri: data.Uri }));
      break;
    case 'ActionRemoved':
      store.dispatch(removeAction({ uri: data.Uri }));
      break;
    case 'GuiTreeUpdated':
      store.dispatch(getCustomGroupsOrdering(store.getState().luaApi));
      break;
    default:
      break;
  }
}

function tearDownSubscription() {
  if (!eventTopic) {
    return;
  }
  eventTopic.talk({
    event: 'stop_subscription'
  });
  eventTopic.cancel();
}

async function setupSubscription(store) {
  // Start subscribing to all events
  eventTopic = api.startTopic('event', {
    event: '*',
    status: 'start_subscription'
  });

  // eslint-disable-next-line no-restricted-syntax
  for await (const data of eventTopic.iterator()) {
    handleData(store, data);
  }
}

const events = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
    case actionTypes.onOpenConnection:
      if (nSubscribers === 0) {
        setupSubscription(store);
      }
      break;
    case actionTypes.onCloseConnection:
      if (nSubscribers === 1 && state.connection.isConnected) {
        tearDownSubscription(store);
      }
      break;
    default:
      break;
  }
  return result;
};

export default events;
