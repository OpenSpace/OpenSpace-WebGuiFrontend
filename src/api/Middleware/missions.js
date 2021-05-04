import {
  initializeMissions,
} from '../Actions';

import api from '../api';

import { actionTypes } from '../Actions/actionTypes';

const getMissions = async callback => {
  const missionsTopic = api.startTopic('missions', {});
  const { value } = await missionsTopic.iterator().next();
  callback(value);
  missionsTopic.cancel();
};

export const missions = store => next => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.onOpenConnection:
      getMissions((data) => {
        console.log("missions loaded", data);
        store.dispatch(initializeMissions(data));
      });
      break;
    default:
      break;
  }
  return result;
};
