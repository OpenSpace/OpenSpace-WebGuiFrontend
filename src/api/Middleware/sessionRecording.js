import { initializeShortcuts } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';

import {
  updateSessionRecording
} from '../Actions'

import api from '../api';

let topic = undefined;
let dataCallback = undefined;
let nSubscribers = 0;

const subscribe = () => {
  topic = api.startTopic('sessionRecording', {
    event: 'start_subscription',
    properties: ['state', 'files']
  });
  (async () => {
    for await (const data of topic.iterator()) {
      dataCallback && dataCallback(data);
    }
  })();
};

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
    const tempTopic = api.startTopic('sessionRecording', {
      event: 'refresh',
      properties: ['state', 'files']
    });
    (async () => {
      const data = await topic.iterator().next();
      dataCallback(data);
      tempTopic.cancel();
    })();
  }
}

export const sessionRecording = store => next => action => {
  const result = next(action);
  const state = store.getState();

  switch (action.type) {
    case actionTypes.onOpenConnection:
      if (nSubscribers > 0) {
        dataCallback = (data) => store.dispatch(updateSessionRecording(data));
        subscribe();
      }
      break;
    case actionTypes.refreshSessionRecording:
      dataCallback = (data) => store.dispatch(updateSessionRecording(data)),
      refresh();
      break;
    case actionTypes.subscribeToSessionRecording:
      ++nSubscribers;
      if (nSubscribers === 1 && state.connection.isConnected) {
        dataCallback = (data) => store.dispatch(updateSessionRecording(data));
        subscribe();
      }
      break;
    case actionTypes.unsubscribeToSessionRecording:
      --nSubscribers;
      if (nSubscribers === 0) {
        unsubscribe();
      }
      break;
    default:
      break;
  }
  return result;
};
