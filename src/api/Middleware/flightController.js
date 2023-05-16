import { connectFlightController, disconnectFlightController, sendFlightControl } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';
import { rootOwnerKey } from '../keys';

import api from '../api';

let topic;
const nSubscribers = 0;

async function connectToFlightControllerTopic(store) {
  topic = api.startTopic('flightcontroller', { type: 'connect' });
}

function sendFlightControlMessage(data) {
  topic.talk(data);
}

export const flightController = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
  case actionTypes.onOpenConnection:
    connectToFlightControllerTopic();
    break;
  case actionTypes.sendFlightControl: {
    if (topic) {
      sendFlightControlMessage(action.payload);
    }
    break;
  }
  default:
    break;
  }
  return result;
};

export default flightController;
