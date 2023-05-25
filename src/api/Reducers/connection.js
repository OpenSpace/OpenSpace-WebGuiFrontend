import actionTypes from '../Actions/actionTypes';

const defaultState = {
  isConnected: false,
  connectedLost: false
};

const connection = (state = defaultState, action) => { // state refers to connection
  switch (action.type) {
  case actionTypes.startConnection:
    return {
      isConnected: false,
      connectionLost: false
    };
  case actionTypes.onOpenConnection:
    return {
      ...state,
      isConnected: true,
      connectionLost: false
    };
  case actionTypes.onCloseConnection:
    return {
      ...state,
      isConnected: false,
      connectionLost: true
    };
  case actionTypes.changeConnectionWait:
    return {
      ...state,
      connectionWait: action.payload.value
    };
  default:
    return state;
  }
};
export default connection;
