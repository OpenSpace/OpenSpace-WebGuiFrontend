/* All the action types are collected here, to make it easier for debugging. */

export const actionTypes = {
  // action types for property tree
  updatePropertyValue: 'PROPERTY_TREE_UPDATE_NODE',
  setPropertyValue: 'PROPERTY_TREE_SET',
  subscribeToProperty: 'PROPERTY_TREE_SUBSCRIBE',
  unsubscribeToProperty: 'PROPERTY_TREE_UNSUBSCRIBE',
  addPropertyOwners: 'PROPERTY_TREE_ADD_OWNERS',
  addProperties: 'PROPERTY_TREE_ADD_PROPERTIES',
  removePropertyOwners: 'PROPERTY_TREE_REMOVE_OWNERS',
  removeProperties: 'PROPERTY_TREE_REMOVE_PROPERTIES',
  reloadPropertyTree: 'PROPERTY_TREE_RELOAD',
  refreshGroups: 'GROUPS_REFRESH',

  updateTime: 'TIME_UPDATE',
  subscribeToTime: 'TIME_SUBSCRIBE',
  unsubscribeToTime: 'TIME_UNSUBSCRIBE',

  // action types for connection
  startConnection: 'CONNECTION_START',
  onOpenConnection: 'CONNECTION_ON_OPEN',
  onCloseConnection: 'CONNECTION_ON_CLOSE',
  changeConnectionWait: 'CONNECTION_CHANGE_WAIT',

  // action types for fetching story data from json files
  fetchData: 'FETCH_DATA',
  fetchDataDone: 'FETCH_DATA_DONE',
  fetchDataFailed: 'FETCH_DATA_FAILED',

  initializeLuaApi: 'LUA_API_INITIALIZE',

  // action types for version
  getVersion: 'VERSION_GET',
  initializeVersion: 'VERSION_INITIALIZE',

  // action types for documentation
  getDocumentation: 'DOCUMENTATION_GET',
  initializeDocumentation: 'DOCUMENTATION_INITIALIZE',

  // action types for exoplanets
  loadExoplanetsData: 'EXOPLANETS_LOAD_DATA',
  initializeExoplanets: 'EXOPLANETS_INITIALIZE',
  addExoplanets: 'EXOPLANETS_ADD',
  removeExoplanets: 'EXOPLANETS_REMOVE',

  // action types for skybrowser
  loadSkyBrowserData: 'SKYBROWSER_LOAD_DATA',
  initializeSkyBrowser: 'SKYBROWSER_INITIALIZE',
  subscribeToSkyBrowser: 'SKYBROWSER_SUBSCRIBE',
  unsubscribeToSkyBrowser: 'SKYBROWSER_UNSUBSCRIBE',
  updateSkyBrowser: 'SKYBROWSER_UPDATE',

  // action types for shortcuts
  subscribeToShortcuts: 'SHORTCUTS_SUBSCRIBE',
  unsubscribeToShortcuts: 'SHORTCUTS_UNSUBSCRIBE',
  initializeShortcuts: 'SHORTCUTS_INITIALIZE',
  triggerAction: 'TRIGGER_ACTION',
  setActionsPath: 'SET_ACTIONS_PATH',
  toggleKeybindViewer: 'TOGGLE_KEYBIND_VIEWER',

  // action types for engine mode
  subscribeToEngineMode: 'ENGINE_MODE_SUBSCRIBE',
  unsubscribeToEngineMode: 'ENGINE_MODE_UNSUBSCRIBE',
  refreshEngineMode: 'ENGINE_MODE_REFRESH',
  updateEngineMode: 'ENGINE_MODE_UPDATE',

  // action types for session recording
  subscribeToSessionRecording: 'SESSION_RECORDING_SUBSCRIBE',
  unsubscribeToSessionRecording: 'SESSION_RECORDING_UNSUBSCRIBE',
  refreshSessionRecording: 'SESSION_RECORDING_REFRESH',
  updateSessionRecording: 'SESSION_RECORDING_UPDATE',

  // action types for flight control
  connectFlightController: 'CONNECT_FLIGHT_CONTROLLER',
  disconnectFlightController: 'DISCONNECT_FLIGHT_CONTROLLER',
  sendFlightControl: 'SEND_FLIGHT_CONTROL',

  // action types for local gui settings
  setNavigationAction: 'LOCAL_SET_NAVIGATION_ACTION',
  setOriginPickerShowFavorites: 'LOCAL_SET_ORIGIN_PICKER_SHOW_FAVORITES',
  setPropertyTreeExpansion: 'LOCAL_SET_PROPERTY_TREE_EXPANSION',
  setPopoverPosition: 'LOCAL_POPOVER_SET_POSIITON',
  setPopoverVisibility: 'LOCAL_POPOVER_SET_VISIBILITY',
  setPopoverAttachment: 'LOCAL_POPOVER_SET_ATTACHMENT',
  addNodePropertyPopover: 'LOCAL_ADD_NODE_PROPERTY_POPOVER',
  removeNodePropertyPopover: 'LOCAL_REMOVE_NODE_PROPERTY_POPOVER',
  setPopoverActiveTab: 'LOCAL_SET_POPOVER_ACTIVE_TAB',
  addNodeMetaPopover: 'LOCAL_ADD_NODE_META_POPOVER',
  removeNodeMetaPopover: 'LOCAL_REMOVE_NODE_META_POPOVER',

  setShowAbout: 'LOCAL_SET_SHOW_ABOUT',

  // action types for transfer function editor
  addTransferFunction: 'TRANSFERFUNCTION_ADD_TRANSFER_FUNCTION',
  addEnvelope: 'TRANSFERFUNCTION_ADD_ENVELOPE',
  addPoint: 'TRANSFERFUNCTION_ADD_POINT',
  deleteEnvelope: 'TRANSFERFUNCTION_DELETE_ENVELOPE',
  clearEnvelopes: 'TRANSFERFUNCTION_CLEAR_ENVELOPES',
  movePoint: 'TRANSFERFUNCTION_MOVE_POINT',
  changeColor: 'TRANSFERFUNCTION_CHANGE_COLOR',
  toggleActiveEnvelope: 'TRANSFERFUNCTION_TOGGLE_ACTIVE_ENVELOPE',
  toggleActivePoint: 'TRANSFERFUNCTION_TOGGLE_ACTIVE_POINT',
  setClickablePoint: 'TRANSFERFUNCTION_TOGGLE_CLICKABLE_POINT',

  // actions types for story tree
  addStoryTree: 'STORY_TREE_ADD',
  addStoryInfo: 'STORY_TREE_ADD_INFO',
  resetStoryInfo: 'STORY_TREE_RESET_INFO',
  resetStoryTree: 'STORY_TREE_RESET',
};
