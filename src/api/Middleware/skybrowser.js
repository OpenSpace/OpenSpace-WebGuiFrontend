import {
  initializeSkyBrowser,
} from '../Actions';

import api from '../api';

import { actionTypes } from '../Actions/actionTypes';

const getWWTImages = async (luaApi, callback) => {
  let imgData = await luaApi.skybrowser.getListOfImages();
  if(imgData) {
    imgData = Object.values(imgData[1]);
    let imgDataWithKey = imgData.map((image) => {
               return {
                   ...image,
                   key: image.identifier
               }
           });
    callback(imgDataWithKey);
  }
  else {
      console.log('No WordWide Telescope images sent to GUI!');
  }
};

const selectImgWWT = async (id, callback) => {
  let script = "openspace.skybrowser.selectImage(" + id + ")";
  api.executeLuaScript(script, false);
  //api.executeLuaScript("openspace.setPropertyValueSingle('Modules.CefWebGui.Reload', nil)");
  callback();
}

export const skybrowser = store => next => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.initializeLuaApi:
      getWWTImages(action.payload, (data) => {
        store.dispatch(initializeSkyBrowser(data));
      });
      break;
    case actionTypes.selectImgSkyBrowser:
      selectImgWWT(action.payload.imgName, () => {
      })
      break;
    default:
      break;
  }
  return result;
};
