import { updateTime } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';

import api from '../api';

let timeTopic;
let nSubscribers = 0;

function handleData(store, data) {
  store.dispatch(updateTime(data));
}

async function setupSubscription(store) {
  timeTopic = api.startTopic('time', {
    event: 'start_subscription',
  });
  for await (const data of timeTopic.iterator()) {
    handleData(store, data);
  }
}

function tearDownSubscription() {
  if (!timeTopic) {
    return;
  }
  timeTopic.talk({
    event: 'stop_subscription',
  });
  timeTopic.cancel();
}

export const time = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
    case actionTypes.onOpenConnection:
      if (nSubscribers > 0) {
        setupSubscription(store);
      }
    case actionTypes.subscribeToTime:
      ++nSubscribers;
      if (nSubscribers === 1 && state.connection.isConnected) {
        setupSubscription(store);
      }
      break;
    case actionTypes.unsubscribeToTime: {
      if (nSubscribers > 0) {
        --nSubscribers;
      }
      if (timeTopic && nSubscribers === 0) {
        tearDownSubscription();
      }
      break;
    }
    default:
      break;
  }
  return result;
};

export default time;
