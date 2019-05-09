import { actionTypes } from './actionTypes';

export const updatePropertyValue = (description, value) => ({
  type: actionTypes.updatePropertyTreeNode,
  payload: {
    uri: description.Identifier,
    description,
    value,
  },
});

export const changePropertyValue = (uri, value) => ({
  type: actionTypes.changePropertyTreeNode,
  payload: {
    uri,
    value,
  },
});

export const insertNode = node => ({
  type: actionTypes.insertNode,
  payload: {
    node,
  },
});

export const startListening = uri => ({
  type: actionTypes.startListeningToNode,
  payload: {
    uri,
  },
});

export const stopListening = uri => ({
  type: actionTypes.stopListeningToNode,
  payload: {
    uri,
  },
});

export const subscribeToTime = uri => ({
  type: actionTypes.subscribeToTime,
  payload: {},
});

export const unsubscribeToTime = uri => ({
  type: actionTypes.unsubscribeToTime,
  payload: {}
});

export const updateTime = timeData => ({
  type: actionTypes.updateTime,
  payload: timeData
});

export const startConnection = () => ({
  type: actionTypes.startConnection,
  payload: {
  },
});

export const onOpenConnection = () => ({
  type: actionTypes.onOpenConnection,
  payload: {

  },
});

export const onCloseConnection = () => ({
  type: actionTypes.onCloseConnection,
  payload: {

  },
});

export const changeConnectionWait = value => ({
  type: actionTypes.changeConnectionWait,
  payload: {
    value,
  },
});

export const getVersion = () => ({
  type: actionTypes.getVersion,
  payload: {},
});

export const initializeLuaApi = data => ({
  type: actionTypes.initializeLuaApi,
  payload: data
});

export const initializeVersion = data => ({
  type: actionTypes.initializeVersion,
  payload: data
});

export const subscribeToShortcuts = () => ({
  type: actionTypes.subscribeToShortcuts,
  payload: {},
});

export const unsubscribeToShortcuts = () => ({
  type: actionTypes.unsubscribeToShortcuts,
  payload: {},
});

export const initializeShortcuts = data => ({
  type: actionTypes.initializeShortcuts,
  payload: data
});

export const setNavigationAction = data => ({
  type: actionTypes.setNavigationAction,
  payload: data
})