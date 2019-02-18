/* All the action types are collected here, to make it easier for debugging. */

export const actionTypes = {
  // action types for property tree
  updatePropertyTreeNode: 'PROPERTY_TREE_UPDATE_NODE',
  changePropertyTreeNode: 'PROPERTY_TREE_CHANGE_NODE',
  initializePropertyTree: 'PROPERTY_TREE_INITIALIZE',
  startListeningToNode: 'PROPERTY_TREE_START_LISTENING',
  stopListeningToNode: 'PROPERTY_TREE_STOP_LISTENING',
  removeNode: 'PROPERTY_TREE_REMOVE_NODE',
  addNode: 'PROPERTY_TREE_ADD_NODE',
  insertNode: 'PROPERTY_TREE_INSERT_NODE',

  // action types for connection
  startConnection: 'CONNECTION_START',
  onOpenConnection: 'CONNECTION_ON_OPEN',
  onCloseConnection: 'CONNECTION_ON_CLOSE',
  changeConnectionWait: 'CONNECTION_CHANGE_WAIT',

  // action types for version
  getVersion: 'VERSION_GET',
  initializeVersion: 'VERSION_INITIALIZE',

  // action types for shortcuts
  subscribeToShortcuts: 'SHORTCUTS_SUBSCRIBE',
  unsubscribeToShortcuts: 'SHORTCUTS_UNSUBSCRIBE',
  initializeShortcuts: 'SHORTCUTS_INITIALIZE',

  // action types for local gui settings
  setNavigationAction: 'LOCAL_SET_NAVIGATION_ACTION',

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
