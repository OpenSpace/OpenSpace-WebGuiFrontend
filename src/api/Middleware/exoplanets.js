import { initializeExoplanets } from "../Actions";

import api from "../api";

import { actionTypes } from "../Actions/actionTypes";

const getExoplanets = async (luaApi, callback) => {
  let planetList = await luaApi.exoplanets.getListOfExoplanets();
  let actualList = planetList[1];
  if (!actualList) {
    return;
  }
<<<<<<< HEAD
  var listArray = Object.values(actualList);
  listArray = listArray.map((item) => {
    return { name: item, identifier: item };
  });
=======
  var listArray = Object.values(actualList)
  listArray = listArray.map(item => {
    return {"name": item, "identifier": item};
  })
>>>>>>> origin/master
  callback(listArray);
};

const removeSystem = async (data, callback) => {
  let script = "openspace.exoplanets.removeExoplanetSystem('" + data + "')";
  api.executeLuaScript(script, false);
  api.executeLuaScript(
    "openspace.setPropertyValueSingle('Modules.CefWebGui.Reload', nil)"
  );
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
<<<<<<< HEAD
      removeSystem(action.payload.system, () => {});
=======
      removeSystem(action.payload.system, () => {})
>>>>>>> origin/master
      break;
    default:
      break;
  }
  return result;
};
