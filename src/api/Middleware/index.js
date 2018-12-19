import { applyMiddleware } from 'redux';
import { updateBackend } from './propertyTree';
import { connection } from './connection';
import { fetchData } from './fetchData';
import { shortcuts } from './shortcuts';
import { version } from './version';
// import logger from './logger';

const middleware = applyMiddleware(
  // logger, //middleWare for logging state change
  updateBackend,
  connection,
  shortcuts,
  version,
  fetchData,
);

export default middleware;
