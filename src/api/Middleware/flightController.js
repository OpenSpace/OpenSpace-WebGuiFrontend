import actionTypes from '../Actions/actionTypes';
import api from '../api';

let topic;

async function connectToFlightControllerTopic(store) {
  topic = api.startTopic('flightcontroller', { type: 'connect' });
}

function sendFlightControlMessage(data) {
  topic.talk(data);
}

const flightController = (store) => (next) => (action) => {
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
