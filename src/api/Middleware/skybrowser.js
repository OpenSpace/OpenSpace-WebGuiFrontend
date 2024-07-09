import { initializeSkyBrowser, updateSkyBrowser } from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

let skybrowserTopic;
let nSubscribers = 0;

function tearDownSubscription() {
  if (!skybrowserTopic) {
    return;
  }
  skybrowserTopic.talk({
    event: 'stop_subscription'
  });
  skybrowserTopic.cancel();
}

async function setupSubscription(store) {
  skybrowserTopic = api.startTopic('skybrowser', {
    event: 'start_subscription'
  });
  // eslint-disable-next-line no-restricted-syntax
  for await (const data of skybrowserTopic.iterator()) {
    switch(data.type) {
      case "browser_data": {
        store.dispatch(updateSkyBrowser(data.data));
        break;
      }
      case "image_collection": {
        store.dispatch(initializeSkyBrowser(data.data));
        break;
      }
      default: {
        break;
      }
    }
  }
}

const skybrowser = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
    case actionTypes.loadSkyBrowserData:
      skybrowserTopic.talk({
        event: 'send_image_collection'
      });
      break;
    case actionTypes.moveHoverCircle:
      skybrowserTopic.talk({
        event: 'move_hover_circle',
        url: action.payload
      });
      break;
    case actionTypes.disableHoverCircle:
      skybrowserTopic.talk({
        event: 'disable_hover_circle',
        url: action.payload
      });
      break;
    case actionTypes.startFineTuningTarget:
      skybrowserTopic.talk({
        event: 'start_fine_tuning_target',
        identifier: action.payload
      });
      break;
    case actionTypes.fineTuneTarget:
      skybrowserTopic.talk({
        event: 'fine_tune_target',
        identifier: action.payload.identifier,
        translation: action.payload.translation
      });
      break;
    case actionTypes.onOpenConnection:
      if (nSubscribers > 0) {
        setupSubscription(store);
      }
      break;
    case actionTypes.subscribeToSkyBrowser:
      ++nSubscribers;
      if (nSubscribers === 1 && state.connection.isConnected) {
        setupSubscription(store);
      }
      break;
    case actionTypes.unsubscribeToSkyBrowser:
      if (nSubscribers > 0) {
        --nSubscribers;
      }
      if (skybrowserTopic && nSubscribers === 0) {
        tearDownSubscription();
      }
      break;
    default:
      break;
  }
  return result;
};

export default skybrowser;
