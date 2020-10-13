import {
  initializeExoplanets,
} from '../Actions';

import api from '../api';

import { actionTypes } from '../Actions/actionTypes';

const getExoplanets = async (luaApi, callback) => {
  var planetList = await luaApi.exoplanets.getListOfExoplanets();
  var listArray = Object.values(planetList[1])
  listArray = listArray.map(item => {
    return {"name": item, "identifier": item};
  })
  callback(listArray);
};

const removeSystem = async (data, callback) => {
  let script = "openspace.exoplanets.removeExoplanetSystem('"+ data +"')";
  api.executeLuaScript(script, false);
  api.executeLuaScript("openspace.setPropertyValueSingle('Modules.CefWebGui.Reload', nil)");
  callback();
}

export const exoplanets = store => next => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.initializeLuaApi:
      getExoplanets(action.payload, (data) => {
        store.dispatch(initializeExoplanets(data));
      });
      break;
    case actionTypes.removeExoplanets:
      removeSystem(action.payload.system, () => {
      })
      break;
    default:
      break;
  }
  return result;
};
