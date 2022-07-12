import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  navigationPath: '/',
  data: [],
  showKeybinds: false,
};

export const shortcuts = (state = defaultState, action) => { // state refers to version
  switch (action.type) {
    case actionTypes.initializeShortcuts:
      return {
        ...state,
        isInitialized: true,
        data: { ...action.payload },
        navigationPath: '/',
      };
    case actionTypes.setActionsPath:
      return {
        ...state,
        navigationPath: action.payload,
      };
    case actionTypes.toggleKeybindViewer:
      console.log('was showing?', state.showKeybinds);
      return {
        ...state,
        showKeybinds: !state.showKeybinds,
      };
    default:
      return state;
  }
};
