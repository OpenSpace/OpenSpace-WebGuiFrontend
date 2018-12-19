import { combineReducers } from 'redux';
import { propertyOwner as propertyTree } from './propertyTree';
import { connection } from './connection';
import { fetchData} from './fetchData';
import { storyTree } from './storyTree';
import { shortcuts } from './shortcuts';
import { version } from './version';

// Add more reducers here
const openspaceApp = combineReducers({
  propertyTree,
  connection,
  fetchData,
  storyTree,
  shortcuts,
  version,
});

export default openspaceApp;
