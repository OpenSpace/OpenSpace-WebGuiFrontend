import { combineReducers } from 'redux';
import { propertyOwner as propertyTree } from './propertyTree';
import { connection } from './connection';
import { version } from './version';

// Add more reducers here
const openspaceApp = combineReducers({
  propertyTree,
  connection,
  version,
});

export default openspaceApp;
