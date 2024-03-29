import {
  initializeMissions
} from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

const getMissions = async (callback) => {
  const missionsTopic = api.startTopic('missions', {});
  const { value } = await missionsTopic.iterator().next();
  callback(value);
  missionsTopic.cancel();
};

const missions = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.onOpenConnection:
      getMissions((data) => {
        store.dispatch(initializeMissions(data));
      });
      break;
    default:
      break;
  }
  return result;
};
export default missions;
