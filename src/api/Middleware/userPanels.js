import {
  initializeUserPanels
} from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

const getUserPanels = async (luaApi, callback) => {

  
    //TODO can remove this for v.20 after 
    //web.asset update
    const userFolder = await luaApi.absPath("${USER}")
    const userwww = userFolder[1] + '/www';
    const served = await luaApi.getPropertyValue("Modules.WebGui.Directories");
  
    var values = Object.values(served[1])
    if (values.indexOf('user') < 0 ) {
      values.push('user');
      values.push(userwww)
      luaApi.setPropertyValueSingle("Modules.WebGui.Directories", values)
    }
    //end todo
    const panelPath = await luaApi.absPath("${USER}/www")
    const panelList = await luaApi.walkDirectoryFolders(panelPath[1]);

    const newList = Object.values(panelList[1]).map((panel) => ( {
      name: panel.substr(panel.lastIndexOf('/') + 1), path: panel 
    }));
    
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
