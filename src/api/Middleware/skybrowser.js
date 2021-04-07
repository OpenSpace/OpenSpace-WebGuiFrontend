import {
  initializeSkyBrowser,
} from '../Actions';

import api from '../api';

import { actionTypes } from '../Actions/actionTypes';

const getWWTImages = async (luaApi, callback) => {
  var imgList = await luaApi.skybrowser.create();
  var imagesNames = Object.keys(imgList[1]);
  var imagesUrls = Object.values(imgList[1]);
  var listArray = imagesNames.map( function(item, index) {
    return {"name" : item , "identifier": item, "key": item, "url": imagesUrls[index]};
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
