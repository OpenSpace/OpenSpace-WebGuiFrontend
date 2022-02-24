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
