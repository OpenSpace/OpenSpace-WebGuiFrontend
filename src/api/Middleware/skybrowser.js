import {
  initializeSkyBrowser,
} from '../Actions';

import api from '../api';

import { actionTypes } from '../Actions/actionTypes';

const getWWTImages = async (luaApi, callback) => {
  var imgList = await luaApi.skybrowser.create();
  console.log(imgList);
  
  var listArray = Object.values(imgList[1]);

  listArray = listArray.map(function(data, index) {
    return {"name": data, "identifier": index.toString()};
  })
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
