import * as helperFunctions from '../../utils/propertyTreeHelpers';
import { actionTypes } from '../Actions/actionTypes';

function updateActionNode(action, node) {
  return {
    ...action,
    payload: {
      node,
    },
  };
};

function generateSubAction(state, action, subownerIdentifier) {
  const payload = action.payload || {};
  const uri = helperFunctions.splitUri(payload.uri || '');
  if (uri[0] === subownerIdentifier) {
    return {
      ...action,
      payload: {
        ...action.payload,
        uri: uri.slice(1)
      }
    }
  }
  return {};
}

const properties = (state = [], action) => { // state refers to an array of properties
  switch (action.type) {
    case actionTypes.insertNode:
      return action.payload.node.properties.map((element) => {
        return property({}, updateActionNode(action, element));
      });
    case actionTypes.updatePropertyValue:
    case actionTypes.setPropertyValue:
    case actionTypes.subscribeToProperty:
    case actionTypes.unsubscribeToProperty:
      return state.map((element) => {
        if (element.id === action.payload.uri[0]) {
          return property(element, action);
        }
        return element;
      });
    default:
      return state;
  }
};

const property = (state = {}, action) => { // state refers to a single property
  switch (action.type) {
    case actionTypes.insertNode:
      return {
        id: helperFunctions.getIdOfProperty(action.payload.node.Description.Identifier),
        Description: action.payload.node.Description,
        Value: action.payload.node.Value,
      };
    case actionTypes.updatePropertyValue:
    case actionTypes.setPropertyValue:
      return {
        ...state,
        Value: action.payload.value,
      };
    default:
      return state;
  }
};

const propertyOwners = (state = [], action) => { // state refers to an array of property owners
  switch (action.type) {
    case actionTypes.insertNode: {
      return action.payload.subowners.map(() => propertyOwner({}, action));
    }
    default:
      return state.map(subowner => {
        const subAction = generateSubAction(state, action, subowner.identifier)
        return propertyOwner(subowner, subAction);
      });
    }
}

export const propertyOwner = (state = {}, action = {}) => { // state refers to a single node
  if (!action) {
    return state;
  }
  const payload = action.payload || {};
  const uri = helperFunctions.splitUri(payload.uri || '');

  if (uri.length === 0) {
    switch (action.type) {
      case actionTypes.insertNode:
        return {
          identifier: action.payload.node.identifier,
          guiName: action.payload.node.guiName,
          properties: properties({}, action),
          subowners: action.payload.node.subowners.map((subowner) => {
            return propertyOwner({}, updateActionNode(action, subowner));
          }),
          tag: (action.payload.node.tag === undefined) ? [] : action.payload.node.tag,
        };
    }
  }

  return {
    ...state,
    properties: properties(state.properties, action),
    subowners:  propertyOwners(state.subowners, action)
  };
};
