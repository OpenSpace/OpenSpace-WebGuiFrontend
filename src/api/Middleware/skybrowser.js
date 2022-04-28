import { initializeSkyBrowser, updateSkyBrowser } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';
import api from '../api';

let skybrowserTopic = undefined;
let nSubscribers = 0;

function handleData(store, data) {
  store.dispatch(updateSkyBrowser(data));
}

function tearDownSubscription() {
  if (!skybrowserTopic) {
    return;
  }
  skybrowserTopic.talk({
    event: 'stop_subscription'
  });
  skybrowserTopic.cancel();
}

const getWWTImages = async (luaApi, callback) => {
  try {
    if (!luaApi.skybrowser) {
      throw new Error('The Sky Browser Module is not loaded!');
    }
    let imgData = await luaApi.skybrowser.getListOfImages();
    if (imgData) {
      imgData = Object.values(imgData[1]);
      if(imgData.length === 0) {
        callback([]);
      }
      else {
        const imgDataWithKey = imgData.map(image => ({
          ...image,
          key: image.identifier,
        }));
        callback(imgDataWithKey);
      }
    } else {
      throw new Error('No AAS WorldWide Telescope images!');
    }
  }
  catch(e) {
    console.error(e);
  }
};

async function setupSubscription(store) {
  console.log("Set up skybrowser subscription");
  skybrowserTopic = api.startTopic('skybrowser', {
    event: 'start_subscription',
  });
  for await (const data of skybrowserTopic.iterator()) {
    handleData(store, data);
  }
}

export const skybrowser = store => next => (action) => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
    case actionTypes.loadSkyBrowserData:
      getWWTImages(action.payload, (imageList) => {
        store.dispatch(initializeSkyBrowser(imageList));
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
