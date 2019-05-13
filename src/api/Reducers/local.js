import { actionTypes } from '../Actions/actionTypes';
import { combineReducers } from 'redux';

/**
 * Origin Picker
 */
const defaultOriginPicker = {
  action: 'Focus'
};
const originPicker = (state = defaultOriginPicker, action) => {
  switch (action.type) {
    case actionTypes.setNavigationAction:
      return {
        ...state,
        action: action.payload
      };
    default:
      return state;
  }
};


/**
 * Time picker
 */ 
const defaultTimePicker = {
  // Todo: move state such as lock and calendar here.
}
const timePicker = (state = defaultTimePicker, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

/**
 * Popovers
 */
const defaultPopover = {
  visible: false,
  position: undefined,
  attached: true
}
const popover = (state = defaultPopover, action) => {
  switch (action.type) {
    case actionTypes.setPopoverVisibility:
      return {
        ...state,
        visible: action.payload.visible
      }
    case actionTypes.setPopoverPosition:
      return {
        ...state,
        position: action.payload.position
      };
    case actionTypes.setPopoverAttachment:
      return {
        ...state,
        attached: action.payload.attached
      }
    default:
      return state;
  }
}

const popovers = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.setPopoverPosition:
    case actionTypes.setPopoverVisibility:
    case actionTypes.setPopoverAttachment:
      console.log('change!', action.payload.popover)
      return {
        ...state,
        [action.payload.popover]: popover(state[action.payload.popover], action)
      };
    default:
      return {
        originPicker: popover(state.originPicker, action),
        timePicker: popover(state.timePicker, action)
      }
  }
}

/**
 * Expanded properties
 */
const defaultPropertyTreeExpansion = {};
const propertyTreeExpansion = (state = defaultPropertyTreeExpansion, action) => {
  switch (action.type) {
    case actionTypes.setPropertyTreeExpansion:
      return {
        ...state,
        [action.payload.identifier]: action.payload.expanded
      }
    default:
      return state;
  }
}


export const local = combineReducers({
  originPicker,
  timePicker,
  popovers,
  propertyTreeExpansion
});
