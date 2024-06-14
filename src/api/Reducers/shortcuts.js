import actionTypes from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  navigationPath: '/',
  data: [],
  showKeybinds: false
};

const shortcuts = (state = defaultState, action = {}) => { // state refers to shortcuts
  switch (action.type) {
    case actionTypes.initializeShortcuts:
      return {
        ...state,
        isInitialized: true,
        data: action.payload
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
        data: [...state.data, ...action.payload]
      } ;
    case actionTypes.removeAction:
      let newData = state.data;
      const index = newData.findIndex((element) => element.identifier === action.payload.uri);
      if (index > -1) { // only splice array when item is found
        newData.splice(index, 1); // 2nd parameter means remove one item only
      }
      return {
        ...state,
        data: [...newData]
      };
    default:
      return state;
  }
};
export default shortcuts;
