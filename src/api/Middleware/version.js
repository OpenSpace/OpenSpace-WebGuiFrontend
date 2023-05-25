import {
  initializeVersion
} from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

const getVersion = async (callback) => {
  const versionTopic = api.startTopic('version', {});
  const { value } = await versionTopic.iterator().next();
  callback(value);
  versionTopic.cancel();
};

const version = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.onOpenConnection:
      getVersion((data) => {
        store.dispatch(initializeVersion(data));
      });
      break;
    default:
      break;
  }
  return result;
};
export default version;
