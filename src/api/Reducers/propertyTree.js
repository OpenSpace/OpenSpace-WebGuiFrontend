import { combineReducers } from 'redux';

import actionTypes from '../Actions/actionTypes';

// actions:
// addPropertyOwners
// addProperties
// removePropertyOwners
// removeProperties
// updatePropertyValue
// setPropertyValue

const property = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.updatePropertyValue:
    case actionTypes.setPropertyValue:
      return {
        ...state,
        value: action.payload.value
      };
    default:
      return state;
  }
};

const properties = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.addProperties: {
      const inputProperties = action.payload.properties;
      const newState = { ...state };

      inputProperties.forEach((p) => {
        newState[p.uri] = {
          description: p.description,
          value: p.value
        };
      });

      return newState;
    }
    case actionTypes.removeProperties: {
      const newState = { ...state };
      action.payload.uris.forEach((uri) => {
        delete newState[uri];
      });
      return newState;
    }
    case actionTypes.updatePropertyValue:
      return {
        ...state,
        [action.payload.uri]: property(state[action.payload.uri], action)
      };
    default:
      return state;
  }
};

const propertyOwners = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.addPropertyOwners: {
      const inputOwners = action.payload.propertyOwners;
      const newState = { ...state };
      inputOwners.forEach((owner) => {
        newState[owner.uri] = {
          identifier: owner.identifier,
          name: owner.name,
          properties: owner.properties,
          subowners: owner.subowners,
          tags: owner.tags || []
        };
      });
      return newState;
    }
    case actionTypes.removePropertyOwners: {
      const newState = { ...state };
      action.payload.uris.forEach((uri) => {
        delete newState[uri];
      });
      return newState;
    }
    default:
      return state;
  }
};

const propertyTree = combineReducers({
  properties,
  propertyOwners
});

export default propertyTree;
