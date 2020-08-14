import { connectFlightController, disconnectFlightController, sendFlightControl } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';
import { rootOwnerKey } from '../keys';

import api from '../api';

let topic = undefined;
let nSubscribers = 0;

async function connectToFlightControllerTopic(store) {
  console.log("call start fligth topic with connect");
  topic = api.startTopic('flightcontroller', {type: "connect"});
}

function disconnectFromFlightControllerTopic() {
  if (!topic) {
    return;
  }

  topic.cancel();
}

function sendFlightControlMessage(data) {
  topic.talk(data);
}

export const flightController = store => next => action => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
    case actionTypes.connectFlightController:
    	console.log("conenct gflight middle ware")
      ++nSubscribers;
      if (nSubscribers === 1) {
        connectToFlightControllerTopic(store);
      }
      break;
    case actionTypes.disconnectFlightController: {
      if (nSubscribers > 0) {
        --nSubscribers;
      }
      if (topic && nSubscribers === 0) {
        disconnectFromFlightControllerTopic();
      }
      break;
    }
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
