import { updateDeltaTimes, initializePropertyTree } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';
import { rootOwnerKey } from '../keys';

import api from '../api';
import * as helperFunctions from '../../utils/propertyTreeHelpers';

let deltaTimesTopic = undefined;
let nSubscribers = 0;

function handleData(store, data) {
  store.dispatch(updateDeltaTimes(data));
}

async function setupSubscription(store) {
  deltaTimesTopic = api.startTopic('deltatimesteps', {
    event: 'start_subscription',
  });
  for await (const data of deltaTimesTopic.iterator()) {
    handleData(store, data);
  }
}

function tearDownSubscription() {
  if (!deltaTimesTopic) {
    return;
  }
  deltaTimesTopic.talk({
    event: 'stop_subscription'
  });
  deltaTimesTopic.cancel();
}

export const deltaTimes = store => next => action => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
    case actionTypes.onOpenConnection:
      if (nSubscribers > 0) {
        setupSubscription(store);
      }
    case actionTypes.subscribeToDeltaTimes:
      ++nSubscribers;
      if (nSubscribers === 1 && state.connection.isConnected) {
        setupSubscription(store);
      }
      break;
    case actionTypes.unsubscribeToDeltaTimes: {
      if (nSubscribers > 0) {
        --nSubscribers;
      }
      if (deltaTimesTopic && nSubscribers === 0) {
        tearDownSubscription();
      }
      break;
    }
    default:
      break;
  }
  return result;
};


export default deltaTimes;
