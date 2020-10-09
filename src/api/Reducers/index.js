import { propertyTree } from './propertyTree';
import { groups } from './groups';
import { time } from './time';
import { connection } from './connection';
import { fetchData} from './fetchData';
import { storyTree } from './storyTree';
import { shortcuts } from './shortcuts';
import { version } from './version';
import { documentation } from './documentation';
import { sessionRecording } from './sessionRecording';
import { local } from './local';
import { luaApi } from './luaApi';

// Add more reducers here
const openspaceApp = (state = {}, action) => {
  const propertyTreeReducer = propertyTree(state.propertyTree, action);
  const shortcutsReducer = shortcuts(state.shortcuts, action);
  return {
    propertyTree: propertyTreeReducer,
	  shortcuts: shortcutsReducer,
    groups: groups(state.groups, action, propertyTreeReducer, shortcutsReducer),
    time: time(state.time, action),
    connection: connection(state.connection, action),
    version: version(state.version, action),
    documentation: documentation(state.documentation, action),
    sessionRecording: sessionRecording(state.sessionRecording, action),
    local: local(state.local, action),
    luaApi: luaApi(state.luaApi, action),
    fetchData: fetchData(state.fetchData, action),
    storyTree: storyTree(state.storyTree, action),
    luaApi: luaApi(state.luaApi, action)
  };
};

export default openspaceApp;
