import {
  initializeUserPanels
} from '../Actions';
import actionTypes from '../Actions/actionTypes';

const getUserPanels = async (luaApi, callback) => {
  const slash = (navigator.platform.indexOf('Win') > -1) ? '\\' : '/';
  // eslint-disable-next-line no-template-curly-in-string
  const panelPath = await luaApi.absPath('${USER}/webpanels');
  const panelList = await luaApi.walkDirectoryFolders(panelPath[1]);
  let newList = {};
  if (panelList[1]) {
    newList = Object.values(panelList[1]).map((panel) => ({
      name: panel.substr(panel.lastIndexOf(slash) + 1), path: panel
    }));
  }

  callback(newList);
};

const userPanels = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.loadUserPanelData:
      getUserPanels(action.payload, (data) => {
        store.dispatch(initializeUserPanels(data));
      });
      break;
    default:
      break;
  }
  return result;
};
export default userPanels;
