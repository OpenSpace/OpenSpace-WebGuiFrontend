import { updateCamera } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';
import api from '../api';

let cameraTopic = undefined;
let nSubscribers = 0;

function handleData(store, data) {
  store.dispatch(updateCamera(data));
}

function tearDownSubscription() {
  if (!cameraTopic) {
    return;
  }
  cameraTopic.talk({
    event: 'stop_subscription'
  });
  cameraTopic.cancel();
}

async function setupSubscription(store) {
  console.log("Set up camera subscription");
  cameraTopic = api.startTopic('camera', {
    event: 'start_subscription',
  });
  for await (const data of cameraTopic.iterator()) {
    handleData(store, data);
  }
}

export const camera = store => next => (action) => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
      case actionTypes.onOpenConnection:
        if (nSubscribers > 0) {
        setupSubscription(store);
      }
      break;
    case actionTypes.subscribeToCamera:
      ++nSubscribers;
      if (nSubscribers === 1 && state.connection.isConnected) {
        setupSubscription(store);
      }
      break;
    case actionTypes.unsubscribeToCamera:
      if (nSubscribers > 0) {
        --nSubscribers;
      }
      if (cameraTopic && nSubscribers === 0) {
        tearDownSubscription();
      }
      break;
    default:
      break;
  }
  return result;
};

export default camera;