import actionTypes from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  navigationPath: '/',
  actions: [],
  keybinds: [],
  showKeybinds: false
};

const shortcuts = (state = defaultState, action = {}) => {
  // state refers to shortcuts
  switch (action.type) {
    case actionTypes.initializeShortcuts:
      return {
        ...state,
        isInitialized: true,
        actions: action.payload.actions,
        keybinds: action.payload.keybinds
      };
    case actionTypes.setActionsPath:
      return {
        ...state,
        navigationPath: action.payload
      };
    case actionTypes.toggleKeybindViewer:
      return {
        ...state,
        showKeybinds: !state.showKeybinds
      };
    case actionTypes.addActions:
      return {
        ...state,
        actions: [...state.actions, ...action.payload],
        keybinds: [...state.keybinds, ...action.payload]
      };
    case actionTypes.removeAction: {
      const newData = state.data;
      const index = newData.findIndex((element) => element.identifier === action.payload.uri);
      if (index > -1) {
        // only splice array when item is found
        newData.splice(index, 1); // 2nd parameter means remove one item only
      }
      // If the removed action was the last one with its gui path, we need to change the
      // navigation path
      const indexPath = newData.findIndex((element) => element.guiPath === state.navigationPath);
      const newNavigationPath = indexPath < 0 ? '/' : state.navigationPath;
      return {
        ...state,
        data: [...newData],
        navigationPath: newNavigationPath
      };
    }
    default:
      return state;
  }
};
export default shortcuts;
