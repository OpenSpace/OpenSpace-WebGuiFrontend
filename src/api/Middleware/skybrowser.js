import {
  initializeSkyBrowser,
} from '../Actions';

import api from '../api';

import { actionTypes } from '../Actions/actionTypes';

const getWWTImages = async (luaApi, callback) => {
  try {
    if(!luaApi.skybrowser) {
      throw new Error('No Sky Browser Module loaded!');
    }
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
      throw new Error('No AAS WorldWide Telescope images!');
    }
  }
  catch(e) {

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
