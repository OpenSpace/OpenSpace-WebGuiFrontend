import { combineReducers } from 'redux';

import actionTypes from '../Actions/actionTypes';

/**
 * Origin Picker
 */
const defaultOriginPicker = {
  action: 'Focus'
};
const originPicker = (state = defaultOriginPicker, action = {}) => {
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
};
const timePicker = (state = defaultTimePicker, action = {}) => {
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
  attached: true,
  activeTab: 0
};
const popover = (state = defaultPopover, action = {}) => {
  switch (action.type) {
    case actionTypes.setPopoverVisibility:
      return {
        ...state,
        visible: action.payload.visible
      };
    case actionTypes.setPopoverPosition:
      return {
        ...state,
        position: action.payload.position
      };
    case actionTypes.setPopoverAttachment:
      return {
        ...state,
        attached: action.payload.attached
      };
    default:
      return state;
  }
};

const defaultPopovers = {
  originPicker: popover(),
  timePicker: popover(),
  sessionRecording: popover(),
  screenSpaceRenderables: popover(),
  exoplanets: popover(),
  skybrowser: popover(),
  actions: popover(),
  keybinds: popover(),
  geoposition: popover(),
  focusNodePropertiesPanel: popover({ attached: false }),
  activeNodePropertyPanels: {},
  activeNodeMetaPanels: {},
  flightController: {}
};

const popovers = (state = defaultPopovers, action = {}) => {
  switch (action.type) {
    case actionTypes.setPopoverPosition:
    case actionTypes.setPopoverVisibility:
    case actionTypes.setPopoverAttachment:
      return {
        ...state,
        [action.payload.popover]: popover(state[action.payload.popover], action)
      };
    case actionTypes.addNodePropertyPopover:
      if (action.payload.focus) {
        return {
          ...state,
          focusNodePropertiesPanel: { ...state.focusNodePropertiesPanel, visible: true }
        };
      }
      return {
        ...state,
        activeNodePropertyPanels: {
          ...state.activeNodePropertyPanels,
          [action.payload.identifier]: popover(
            { attached: false, visible: true, activeTab: 0 },
            action
          )
        }
      };

    case actionTypes.removeNodePropertyPopover:
      return {
        ...state,
        activeNodePropertyPanels: {
          ...state.activeNodePropertyPanels,
          [action.payload.identifier]: undefined
        }
      };
    case actionTypes.addNodeMetaPopover:
      return {
        ...state,
        activeNodeMetaPanels: {
          ...state.activeNodeMetaPanels,
          [action.payload.identifier]: popover(
            { attached: false, visible: true, activeTab: 0 },
            action
          )
        }
      };
    case actionTypes.removeNodeMetaPopover:
      return {
        ...state,
        activeNodeMetaPanels: {
          ...state.activeNodeMetaPanels,
          [action.payload.identifier]: undefined
        }
      };
    case actionTypes.setPopoverActiveTab:
      if (action.payload.isFocusNodePanel) {
        return {
          ...state,
          focusNodePropertiesPanel: {
            ...state.focusNodePropertiesPanel,
            activeTab: action.payload.activeTab
          }
        };
      } if (action.payload.isMeta) {
        return {
          ...state,
          activeNodeMetaPanels: {
            ...state.activeNodeMetaPanels,
            [action.payload.identifier]: {
              ...state.activeNodeMetaPanels[action.payload.identifier],
              activeTab: action.payload.activeTab
            }
          }
        };
      }
      return {
        ...state,
        activeNodePropertyPanels: {
          ...state.activeNodePropertyPanels,
          [action.payload.identifier]: {
            ...state.activeNodePropertyPanels[action.payload.identifier],
            activeTab: action.payload.activeTab
          }
        }
      };

    default:
      return state;
  }
};

/**
 * Expanded properties
 */
const defaultPropertyTreeExpansion = {};
const propertyTreeExpansion = (state = defaultPropertyTreeExpansion, action = {}) => {
  switch (action.type) {
    case actionTypes.setPropertyTreeExpansion:
      return {
        ...state,
        [action.payload.identifier]: action.payload.expanded
      };
    default:
      return state;
  }
};

const showAbout = (state = false, action = {}) => {
  switch (action.type) {
    case actionTypes.setShowAbout:
      return action.payload;
    default:
      return state;
  }
};

const local = combineReducers({
  originPicker,
  timePicker,
  popovers,
  propertyTreeExpansion,
  showAbout
});

export default local;
