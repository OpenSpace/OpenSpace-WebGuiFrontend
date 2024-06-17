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

const getWwtData = async (luaApi, callback) => {
  try {
    if (!luaApi.skybrowser) {
      throw new Error('The Sky Browser Module is not loaded!');
    }
    let imgData = await luaApi.skybrowser.listOfImages();
    let collectionUrl = await luaApi.skybrowser.wwtImageCollectionUrl();
    if (collectionUrl) {
      const { url } = collectionUrl[1];
      collectionUrl = url;
    } else {
      throw new Error('No AAS WorldWide Telescope image collection!');
    }
    if (imgData) {
      imgData = Object.values(imgData[1]);
      if (imgData.length === 0) {
        callback([]);
      } else {
        const imgDataWithKey = imgData.map((image) => ({
          ...image,
          key: image.identifier
        }));
        callback({ imageList: imgDataWithKey, url: collectionUrl });
      }
    } else {
      throw new Error('No AAS WorldWide Telescope images!');
    }
  } catch (e) {
    console.error(e);
  }
};

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
      getWwtData(action.payload, (data) => {
        store.dispatch(initializeSkyBrowser(data));
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
