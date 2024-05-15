import { addSceneGraphNode, addPropertyOwners, refreshGroups } from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

let eventTopic;
let nSubscribers = 0;

async function handleData(store, data) {
  switch (data.Event) {
    case "SceneGraphNodeAdded": {
        store.dispatch(addSceneGraphNode({ uri: data.Node, parentUri: "Scene" }));
        break;
    }
    case "ScreenSpaceRenderableAdded": {
        store.dispatch(addSceneGraphNode({ uri: data.Renderable, parentUri: "ScreenSpace" }));
        break;
    }
    case "LayerAdded": {
        //const node = api.getProperty(data.Node);
        //store.dispatch(addPropertyOwners([node]));
        break;
    }
    default: {

    }
  }
}

function tearDownSubscription() {
  if (!eventTopic) {
    return;
  }
  eventTopic.talk({
    event: 'stop_subscription'
  });
  eventTopic.cancel();
}

async function setupSubscription(store) {
    // Start subscribing to all events  
    eventTopic = api.startTopic('event', {
        event: '*',
        status: 'start_subscription'
    });

    // eslint-disable-next-line no-restricted-syntax
    for await (const data of eventTopic.iterator()) {
        handleData(store, data);
    }
}

const events = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
    case actionTypes.onOpenConnection:
        if (nSubscribers === 0) {
        setupSubscription(store);
      }
      break;
     /* 
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
      if (eventTopic && nSubscribers === 0) {
        tearDownSubscription();
      }
      break;*/
    default:
      break;
  }
  return result;
};

export default events;
