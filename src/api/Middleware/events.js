import { addPropertyOwner, removePropertyOwners  } from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

let eventTopic;
let nSubscribers = 0;

async function handleData(store, data) {
  switch (data.Event) {
    case "PropertyOwnerAdded": {
      store.dispatch(addPropertyOwner({ uri: data.Uri }));
      break;
    }
    case "PropertyOwnerRemoved": {
      store.dispatch(removePropertyOwners({ uris: [ data.Uri ] }));
      break;
    }
    default: {

    }
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
