import { actionTypes } from './actionTypes';

export const updatePropertyValue = (uri, value) => ({
  type: actionTypes.updatePropertyValue,
  payload: {
    uri,
    value,
  },
});

export const setPropertyValue = (uri, value) => ({
  type: actionTypes.setPropertyValue,
  payload: {
    uri,
    value,
  },
});

export const addPropertyOwners = propertyOwners => ({
  type: actionTypes.addPropertyOwners,
  payload: {
    propertyOwners,
  },
});

export const addProperties = properties => ({
  type: actionTypes.addProperties,
  payload: {
    properties,
  },
});

export const refreshGroups = () => ({
  type: actionTypes.refreshGroups,
  payload: {},
});

export const subscribeToProperty = uri => ({
  type: actionTypes.subscribeToProperty,
  payload: {
    uri,
  },
});

export const unsubscribeToProperty = uri => ({
  type: actionTypes.unsubscribeToProperty,
  payload: {
    uri,
  },
});

export const subscribeToTime = () => ({
  type: actionTypes.subscribeToTime,
  payload: {},
});

export const unsubscribeToTime = () => ({
  type: actionTypes.unsubscribeToTime,
  payload: {},
});

export const updateTime = timeData => ({
  type: actionTypes.updateTime,
  payload: timeData,
});

export const connectFlightController = () => ({
  type: actionTypes.connectFlightController,
  payload: {},
});

export const disconnectFlightController = () => ({
  type: actionTypes.disconnectFlightController,
  payload: {},
});

export const sendFlightControl = flightControl => ({
  type: actionTypes.sendFlightControl,
  payload: flightControl,
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

export const reloadPropertyTree = () => ({
  type: actionTypes.reloadPropertyTree,
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

export const fetchData = id => ({
  type: actionTypes.fetchData,
  payload: {
    id,
  },
});

export const fetchDataDone = (data, id) => ({
  type: actionTypes.fetchDataDone,
  payload: {
    data,
    id,
  },
});

export const fetchDataFailed = id => ({
  type: actionTypes.fetchDataFailed,
  payload: {
    id,
  },
});

export const addStoryTree = story => ({
  type: actionTypes.addStoryTree,
  payload: {
    story,
  },
});

export const resetStoryTree = reset => ({
  type: actionTypes.resetStoryTree,
  payload: {
    reset,
  },
});

export const addStoryInfo = info => ({
  type: actionTypes.addStoryInfo,
  payload: {
    info,
  },
});

export const resetStoryInfo = () => ({
  type: actionTypes.resetStoryInfo,
  payload: {
  },
});

export const getVersion = () => ({
  type: actionTypes.getVersion,
  payload: {},
});

export const getDocumentation = () => ({
  type: actionTypes.getDocumentation,
  payload: {},
});

export const initializeLuaApi = data => ({
  type: actionTypes.initializeLuaApi,
  payload: data,
});

export const initializeVersion = data => ({
  type: actionTypes.initializeVersion,
  payload: data,
});

export const initializeDocumentation = data => ({
  type: actionTypes.initializeDocumentation,
  payload: data,
});

export const initializeExoplanets = data => ({
  type: actionTypes.initializeExoplanets,
  payload: data,
});

export const addExoplanets = data => ({
  type: actionTypes.addExoplanets,
  payload: data,
});

export const removeExoplanets = data => ({
  type: actionTypes.removeExoplanets,
  payload: data,
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
  payload: data,
});

export const triggerAction = data => ({
  type: actionTypes.triggerAction,
  payload: data,
});

export const setActionsPath = data => ({
  type: actionTypes.setActionsPath,
  payload: data,
});

export const toggleKeybindViewer = data => ({
  type: actionTypes.toggleKeybindViewer,
  payload: data,
});


export const setNavigationAction = data => ({
  type: actionTypes.setNavigationAction,
  payload: data,
});

export const setOriginPickerShowFavorites = showFavorites => ({
  type: actionTypes.setOriginPickerShowFavorites,
  payload: showFavorites,
});

export const setPopoverVisibility = data => ({
  type: actionTypes.setPopoverVisibility,
  payload: data,
});

export const setShowAbout = show => ({
  type: actionTypes.setShowAbout,
  payload: show,
});

export const setPopoverAttachment = data => ({
  type: actionTypes.setPopoverPosition,
  payload: data,
});

export const setPopoverPosition = data => ({
  type: actionTypes.setPopoverPosition,
  payload: data,
});

export const addNodePropertyPopover = data => ({
  type: actionTypes.addNodePropertyPopover,
  payload: data,
});

export const removeNodePropertyPopover = data => ({
  type: actionTypes.removeNodePropertyPopover,
  payload: data,
});

export const addNodeMetaPopover = data => ({
  type: actionTypes.addNodeMetaPopover,
  payload: data,
});

export const removeNodeMetaPopover = data => ({
  type: actionTypes.removeNodeMetaPopover,
  payload: data,
});


export const setPopoverActiveTab = data => ({
  type: actionTypes.setPopoverActiveTab,
  payload: data,
});

export const setPropertyTreeExpansion = data => ({
  type: actionTypes.setPropertyTreeExpansion,
  payload: data,
});

export const subscribeToEngineMode = () => ({
  type: actionTypes.subscribeToEngineMode,
  payload: {},
});

export const unsubscribeToEngineMode = () => ({
  type: actionTypes.unsubscribeToEngineMode,
  payload: {},
});

export const refreshEngineMode = () => ({
  type: actionTypes.refreshEngineMode,
  payload: {},
});

export const updateEngineMode = data => ({
  type: actionTypes.updateEngineMode,
  payload: data,
});

export const subscribeToSessionRecording = () => ({
  type: actionTypes.subscribeToSessionRecording,
  payload: {},
});

export const unsubscribeToSessionRecording = () => ({
  type: actionTypes.unsubscribeToSessionRecording,
  payload: {},
});

export const refreshSessionRecording = () => ({
  type: actionTypes.refreshSessionRecording,
  payload: {},
});

export const updateSessionRecording = data => ({
  type: actionTypes.updateSessionRecording,
  payload: data,
});
