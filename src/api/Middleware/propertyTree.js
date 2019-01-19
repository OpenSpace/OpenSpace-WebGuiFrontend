import DataManager from '../DataManager';
import { updatePropertyValue, initializePropertyTree } from '../Actions';
import * as helperFunctions from '../../utils/propertyTreeHelpers';
import { actionTypes } from '../Actions/actionTypes';
import { rootOwnerKey } from '../keys';

const subscriptionIds = [];

const handleUpdatedValues = store => ({ Description, Value }) => {
  store.dispatch(updatePropertyValue(Description, Value));
  const state = store.getState();
  const property = helperFunctions.traverseTreeWithURI(state.propertyTree, Description.Identifier);
  if (property.listeners < 1) {
    if (DataManager.unsubscribe(Description.Identifier, subscriptionIds[Description.Identifier])) {
      delete subscriptionIds[Description.Identifier];
    }
  }
};

const startSubscription = (URI, store) => {
  subscriptionIds[URI] = DataManager.subscribe(URI, handleUpdatedValues(store));
};

const getPropertyTree = (dispatch) => {
  DataManager.getValue(rootOwnerKey, (Value) => {
    dispatch(initializePropertyTree(Value));
  });
};

const sendDataToBackEnd = (node) => {
  switch (node.Description.Type) {
    case 'TransferFunctionProperty': {
      const convertedEnvelopes = helperFunctions.convertEnvelopes(node.Value);
      DataManager.setValue(node.Description.Identifier, convertedEnvelopes);
      break;
    }
    case 'TriggerProperty': {
      DataManager.trigger(node.Description.Identifier);
      break;
    }
    default: {
      DataManager.setValue(node.Description.Identifier, node.Value);
      break;
    }
  }
};

export const updateBackend = store => next => (action) => {
  const result = next(action);
  const state = store.getState();
  switch (action.type) {
    case actionTypes.onOpenConnection:
      getPropertyTree(store.dispatch);
      break;
    case actionTypes.changePropertyTreeNode: {
      const nodeToUpdate = helperFunctions
        .traverseTreeWithURI(state.propertyTree, action.payload.URI);
      sendDataToBackEnd(nodeToUpdate);
      break;
    }
    case actionTypes.startListeningToNode: {
      const nodeToListen = helperFunctions
        .traverseTreeWithURI(state.propertyTree, action.payload.URI);
      if (nodeToListen.listeners === 1) {
        startSubscription(action.payload.URI, store);
      }
      break;
    }
    default:
      break;
  }
  return result;
};

export default updateBackend;