import { updatePropertyValue, initializePropertyTree } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';
import { rootOwnerKey } from '../keys';

import api from '../api';
import * as helperFunctions from '../../utils/propertyTreeHelpers';

const subscriptions = {};

const handleUpdatedValues = store => ({ Description, Value }) => {
  const uri =  Description.Identifier;
  store.dispatch(updatePropertyValue(Description, Value));
  const state = store.getState();
  const property = helperFunctions.findSubtree(state.propertyTree, uri);

  // "Lazy unsubscribe":
  // Cancel the subscription whenever there is an update from the 
  // server, and there are no more active listeners on the client.
  // (As opposed to cancelling the subscription immediately when the
  //  number of listeners hit zero)
  if (property.listeners < 1) {
    if (subscriptions[uri]) {
      subscriptions[uri].cancel();
      delete subscriptions[uri];
    }
  }
};

const startSubscription = async (uri, store) => {
  if (subscriptions[uri]) {
    return;
  }
  const subscription = api.subscribeToProperty(uri);
  const handleValues = handleUpdatedValues(store);

  subscriptions[uri] = subscription;
  for await (const data of subscription.iterator()) {
    handleValues(data);
  }
};

const getPropertyTree = async (dispatch) => {
  const value = await api.getProperty(rootOwnerKey);
  dispatch(initializePropertyTree(value));
};

const sendDataToBackEnd = (node) => {
  api.setProperty(node.Description.Identifier, node.Value);
};

export const propertyTree = store => next => (action) => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
    case actionTypes.onOpenConnection:
      getPropertyTree(store.dispatch);
      break;
    case actionTypes.changePropertyTreeNode: {
      const nodeToUpdate = helperFunctions
        .findSubtree(state.propertyTree, action.payload.uri);
      if (!nodeToUpdate) {
        return;
      }
      sendDataToBackEnd(nodeToUpdate);
      break;
    }
    case actionTypes.startListeningToNode: {
      const subscriptionNode = helperFunctions
        .findSubtree(state.propertyTree, action.payload.uri);
      if (!subscriptionNode) {
        return;
      }
      startSubscription(action.payload.uri, store);
      break;
    }
    default:
      break;
  }
  return result;
};

export default propertyTree;
