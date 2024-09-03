import { connectFlightController, disconnectFlightController, sendFlightControl } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';
import { rootOwnerKey } from '../keys';

import api from '../api';

let topic = undefined;
let nSubscribers = 0;

async function connectToFlightControllerTopic(store) {
  topic = api.startTopic(
    'flightcontroller',
    {
      event: 'start_subscription',
      type: "connect"
    }
  );
}

const unsubscribe = () => {
  if (!topic) {
    return;
  }
  topic.talk({
    event: 'stop_subscription'
  });
  topic.cancel();
}

const refresh = () => {
  if (topic) {
    topic.talk({
      event: 'refresh'
    });
  } else {
    // If we do not have a subscription, we need to create a new topic.
    const tempTopic = api.startTopic('flightcontroller', {
      event: 'refresh'
    });
  }
}

function sendFlightControlMessage(data) {
  topic.talk(data);
}

export const flightController = store => next => action => {
  const result = next(action);
  const state = store.getState();

  switch (action.type) {
    case actionTypes.onOpenConnection:
      if (nSubscribers > 0) {
        connectToFlightControllerTopic();
      }
      break;
    case actionTypes.connectFlightController:
      ++nSubscribers;
      if (nSubscribers === 1 && state.connection.isConnected) {
        connectToFlightControllerTopic();
      }
      break;
    case actionTypes.refreshFlightController:
      refresh();
      break;
    case actionTypes.disconnectFlightController:
      if (nSubscribers > 0) {
        --nSubscribers;
      }
      if (topic && nSubscribers === 0) {
        unsubscribe();
        topic.cancel();
      }
      break;
    case actionTypes.sendFlightControl:
      if (topic && nSubscribers > 0) {
        sendFlightControlMessage(action.payload);
      }
      break;
    default:
      break;
  }
  return result;
};

export default flightController;
