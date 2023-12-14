import { updateCameraPath } from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

let cameraPathTopic;
let nSubscribers = 0;

function handleData(store, data) {
  store.dispatch(updateCameraPath(data));
}

function tearDownSubscription() {
  if (!cameraPathTopic) {
    return;
  }
  cameraPathTopic.talk({
    event: 'stop_subscription'
  });
  cameraPathTopic.cancel();
}

async function setupSubscription(store) {
  cameraPathTopic = api.startTopic('cameraPath', {
    event: 'start_subscription'
  });
  // eslint-disable-next-line no-restricted-syntax
  for await (const data of cameraPathTopic.iterator()) {
    handleData(store, data);
  }
}

const cameraPath = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
    case actionTypes.onOpenConnection:
      if (nSubscribers > 0) {
        setupSubscription(store);
      }
      break;
    case actionTypes.subscribeToCameraPath:
      ++nSubscribers;
      if (nSubscribers === 1 && state.connection.isConnected) {
        setupSubscription(store);
      }
      break;
    case actionTypes.unsubscribeToCameraPath:
      if (nSubscribers > 0) {
        --nSubscribers;
      }
      if (cameraPathTopic && nSubscribers === 0) {
        tearDownSubscription();
      }
      break;
    default:
      break;
  }
  return result;
};

export default cameraPath;
