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
  refreshGroups: 'GROUPS_REFRESH',

  updateTime: "TIME_UPDATE",
  subscribeToTime: 'TIME_SUBSCRIBE',
  unsubscribeToTime: 'TIME_UNSUBSCRIBE',

  // action types for connection
  startConnection: 'CONNECTION_START',
  onOpenConnection: 'CONNECTION_ON_OPEN',
  onCloseConnection: 'CONNECTION_ON_CLOSE',
  changeConnectionWait: 'CONNECTION_CHANGE_WAIT',

  initializeLuaApi: 'LUA_API_INITIALIZE',

  // action types for version
  getVersion: 'VERSION_GET',
  initializeVersion: 'VERSION_INITIALIZE',

  // action types for shortcuts
  subscribeToShortcuts: 'SHORTCUTS_SUBSCRIBE',
  unsubscribeToShortcuts: 'SHORTCUTS_UNSUBSCRIBE',
  initializeShortcuts: 'SHORTCUTS_INITIALIZE',

  // action types for local gui settings
  setNavigationAction: 'LOCAL_SET_NAVIGATION_ACTION',
  setPropertyTreeExpansion: 'LOCAL_SET_PROPERTY_TREE_EXPANSION',
  setPopoverPosition: 'LOCAL_POPOVER_SET_POSIITON',
  setPopoverVisibility: 'LOCAL_POPOVER_SET_VISIBILITY',
  setPopoverAttachment: 'LOCAL_POPOVER_SET_ATTACHMENT',
  addNodeProperyPopover: 'LOCAL_ADD_NODE_PROPERTY_POPOVER',

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
};
