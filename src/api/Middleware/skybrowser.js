import {
  initializeSkyBrowser,
} from '../Actions';

import api from '../api';

import { actionTypes } from '../Actions/actionTypes';

const getWWTImages = async (luaApi, callback) => {
  var imgList = await luaApi.skybrowser.create();
  var imgData = Object.values(imgList[1]);
  // item[0] -> index, item[1] -> image name, item[2] -> image url
  var listArray = imgData.map( function(item, index) {
    return {"name" : item[1] , "identifier": item[1] , "key": index.toString(), "url": item[2]};
  });
  callback(listArray);
};

const selectImgWWT = async (data, callback) => {
  let script = "openspace.skybrowser.loadCollection(\"" + data + "\")";
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
