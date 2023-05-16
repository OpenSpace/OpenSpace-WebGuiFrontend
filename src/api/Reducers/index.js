import { propertyTree } from './propertyTree';
import { groups } from './groups';
import { time } from './time';
import { connection } from './connection';
import { fetchData } from './fetchData';
import { storyTree } from './storyTree';
import { shortcuts } from './shortcuts';
import { version } from './version';
import { documentation } from './documentation';
import { exoplanets } from './exoplanets';
import { skybrowser } from './skybrowser';
import { engineMode } from './engineMode';
import { sessionRecording } from './sessionRecording';
import { local } from './local';
import { luaApi } from './luaApi';
import { camera } from './camera';
import { missions } from './missions';

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
    camera: camera(state.camera, action),
    documentation: documentation(state.documentation, action),
    exoplanets: exoplanets(state.exoplanets, action),
    skybrowser: skybrowser(state.skybrowser, action),
    engineMode: engineMode(state.engineMode, action),
    sessionRecording: sessionRecording(state.sessionRecording, action),
    local: local(state.local, action),
    luaApi: luaApi(state.luaApi, action),
    fetchData: fetchData(state.fetchData, action),
    storyTree: storyTree(state.storyTree, action),
    version: version(state.version, action),
    missions: missions(state.missions, action)
  };
};

export default openspaceApp;
