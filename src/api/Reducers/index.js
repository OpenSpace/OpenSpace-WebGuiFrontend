import { combineReducers } from 'redux';
import { propertyOwner as propertyTree } from './propertyTree';
import { connection } from './connection';
import { shortcuts } from './shortcuts';
import { version } from './version';
import { local } from './local';

// Add more reducers here
const openspaceApp = combineReducers({
  propertyTree,
  connection,
  shortcuts,
  version,
  local
});

export default openspaceApp;
