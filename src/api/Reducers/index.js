import { combineReducers } from 'redux';
import { propertyOwner as propertyTree } from './propertyTree';
import { time } from './time';
import { connection } from './connection';
import { shortcuts } from './shortcuts';
import { version } from './version';
import { local } from './local';
import { luaApi } from './luaApi';

// Add more reducers here
const openspaceApp = combineReducers({
  propertyTree,
  time,
  connection,
  shortcuts,
  version,
  local,
  luaApi,
});

export default openspaceApp;
