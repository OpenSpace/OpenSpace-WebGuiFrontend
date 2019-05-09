import { updatePropertyValue, insertNode } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';
import { rootOwnerKey } from '../keys';

import api from '../api';
import * as helperFunctions from '../../utils/propertyTreeHelpers';

// Maps from uri to number of subscriptions:
// Subscriptions to properties existing in the property tree
const nSubscriptions = {};
// Subscriptions to properties that are not (yet) in the property tree
const nPendingSubscriptions = {};

// Map from uri to subscription object:
const subscriptions = {};

const handleUpdatedValues = (store, { Description, Value }) => {
  const uri =  Description.Identifier;
  store.dispatch(updatePropertyValue(Description, Value));
  const state = store.getState();
  const property = helperFunctions.findSubtree(state.propertyTree, uri);

  // "Lazy unsubscribe":
  // Cancel the subscription whenever there is an update from the 
  // server, and there are no more active listeners on the client.
  // (As opposed to cancelling the subscription immediately when the
  //  number of listeners hit zero)
  if (nSubscriptions[uri] < 1) {
    subscriptions[uri].cancel();
    delete subscriptions[uri];
    delete nSubscriptions[uri];
  }
};


const startPendingSubscriptions = store => {
  const state = store.getState();
  Object.keys(nPendingSubscriptions).forEach(uri => {
    const property = helperFunctions.findSubtree(state.propertyTree, uri);
    if (property) {
      if (nPendingSubscriptions[uri] > 0) {
        console.log("retroactive start of subscription " + state);
        startSubscription(store, uri);
      }
      delete nPendingSubscriptions[uri];
    }
  });
}

const startSubscription = async (store, uri) => {
  if (subscriptions[uri]) {
    return;
  }
  const subscription = api.subscribeToProperty(uri);
  subscriptions[uri] = subscription;
  for await (const data of subscription.iterator()) {
    handleUpdatedValues(store, data);
  }
};

const getPropertyTree = async (dispatch) => {
  const value = await api.getProperty(rootOwnerKey);
  dispatch(insertNode(value));
};

const setValueInBackend = (node) => {
  api.setProperty(node.Description.Identifier, node.Value);
};

export const propertyTree = store => next => (action) => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
    case actionTypes.onOpenConnection:
      getPropertyTree(store.dispatch);
      break;
    case actionTypes.insertNode:
      startPendingSubscriptions(store);
      break
    case actionTypes.changePropertyTreeNode: {
      const nodeToUpdate = helperFunctions
        .findSubtree(state.propertyTree, action.payload.uri);
      if (!nodeToUpdate) {
        console.warn('Trying to set non-existing property: ' + action.payload.uri);
        return;
      }
      setValueInBackend(nodeToUpdate);
      break;
    }
    case actionTypes.startListeningToNode: {
      const uri = action.payload.uri;
      const property = helperFunctions.findSubtree(state.propertyTree, uri);
      const list = property ? nSubscriptions : nPendingSubscriptions;
      const oldCount = list[uri];
      list[uri] = oldCount ? oldCount[uri] + 1 : 1;
      if (!oldCount && property) {
        startSubscription(store, action.payload.uri);
      }
      break;
    }
    case actionTypes.stopListeningToNode: {
      const uri = action.payload.uri;
      const property = helperFunctions.findSubtree(state.propertyTree, uri);
      const list = property ? nSubscriptions : nPendingSubscriptions;
      const oldCount = list[uri];
      if (oldCount) {
        list[uri] = oldCount - 1;
      }
      if (!list[uri] && property) {
        stopSubscription(store, action.payload.uri);
      }
      break;
    }
    default:
      break;
  }
  return result;
};

export default propertyTree;
