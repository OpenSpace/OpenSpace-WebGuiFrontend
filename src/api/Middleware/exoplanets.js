import {
  initializeExoplanets
} from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

const getExoplanets = async (luaApi, callback) => {
  const planetList = await luaApi.exoplanets.listOfExoplanets();
  const actualList = planetList[1];
  if (!actualList) {
    return;
  }
  let listArray = Object.values(actualList);
  listArray = listArray.map((item) => ({ name: item, identifier: item }));
  callback(listArray);
};

const removeSystem = async (data) => {
  const script = `openspace.exoplanets.removeExoplanetSystem('${data}')`;
  api.executeLuaScript(script, false);
};

const exoplanets = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.loadExoplanetsData:
      getExoplanets(action.payload, (data) => {
        store.dispatch(initializeExoplanets(data));
      });
      break;
    case actionTypes.removeExoplanets:
      removeSystem(action.payload.system);
      break;
    default:
      break;
  }
  return result;
};
export default exoplanets;
