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
    return {"name" : item[1] , "identifier": index.toString(), "key": index.toString(), "url": item[2]};
  });
  callback(listArray);
};

export const skybrowser = store => next => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.initializeLuaApi:
      getWWTImages(action.payload, (data) => {
        store.dispatch(initializeSkyBrowser(data));
      });
      break;
    default:
      break;
  }
  return result;
};
