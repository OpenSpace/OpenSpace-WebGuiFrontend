import { combineReducers } from 'redux';
import { propertyTree } from './propertyTree';
import { groups } from './groups';
import { time } from './time';
import { connection } from './connection';
import { shortcuts } from './shortcuts';
import { version } from './version';
import { local } from './local';
import { luaApi } from './luaApi';

// Add more reducers here
const openspaceApp = (state = {}, action) => {
  const propTree = propertyTree(state.propertyTree, action);
  return {
    propertyTree: propTree,
    groups: groups(state.groups, action, propTree),
    time: time(state.time, action),
    connection: connection(state.connection, action),
    shortcuts: shortcuts(state.shortcuts, action),
    version: version(state.version, action),
    local: local(state.local, action),
    luaApi: luaApi(state.luaApi, action)
  };
};

export default openspaceApp;
