import {
  initializeExoplanets
} from '../Actions';

import api from '../api';

import actionTypes from '../Actions/actionTypes';

const getExoplanets = async (luaApi, callback) => {
  const planetList = await luaApi.exoplanets.getListOfExoplanets();
  const actualList = planetList[1];
  if (!actualList) {
    return;
  }
  let listArray = Object.values(actualList);
  listArray = listArray.map((item) => ({ name: item, identifier: item }));
  callback(listArray);
};

const removeSystem = async (data, callback) => {
  const script = `openspace.exoplanets.removeExoplanetSystem('${data}')`;
  api.executeLuaScript(script, false);
  api.executeLuaScript("openspace.setPropertyValueSingle('Modules.CefWebGui.Reload', nil)");
  callback();
};

export const exoplanets = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
  case actionTypes.loadExoplanetsData:
    getExoplanets(action.payload, (data) => {
      store.dispatch(initializeExoplanets(data));
    });
    break;
  case actionTypes.removeExoplanets:
    removeSystem(action.payload.system, () => {});
    break;
  default:
    break;
  }
  return result;
};
