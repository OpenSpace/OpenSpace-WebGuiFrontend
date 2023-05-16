import actionTypes from '../Actions/actionTypes';

import { updateEngineMode } from '../Actions';

import api from '../api';

let topic;
let dataCallback;
let nSubscribers = 0;

const subscribe = () => {
  topic = api.startTopic('engineMode', {
    event: 'start_subscription',
    properties: ['mode']
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
  topic.talk({ event: 'stop_subscription' });
  topic.cancel();
};

const refresh = () => {
  if (topic) {
    topic.talk({ event: 'refresh' });
  } else {
    // If we do not have a subscription, we need to create a new topic
    const tempTopic = api.startTopic('engineMode', {
      event: 'refresh',
      properties: ['mode']
    });
    (async () => {
      const data = await topic.iterator().next();
      dataCallback(data);
      tempTopic.cancel();
    })();
  }
};

const engineMode = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  switch (action.type) {
  case actionTypes.onOpenConnection:
    if (nSubscribers > 0) {
      dataCallback = (data) => store.dispatch(updateEngineMode(data));
      subscribe();
    }
    break;
  case actionTypes.refreshEngineMode:
    dataCallback = (data) => store.dispatch(updateEngineMode(data)),
    refresh();
    break;
  case actionTypes.subscribeToEngineMode:
    ++nSubscribers;
    if (nSubscribers === 1 && state.connection.isConnected) {
      dataCallback = (data) => store.dispatch(updateEngineMode(data));
      subscribe();
    }
    break;
  case actionTypes.unsubscribeToEngineMode:
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
export default engineMode;
