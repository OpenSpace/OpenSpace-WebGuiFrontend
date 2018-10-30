import { applyMiddleware } from 'redux';
import { updateBackend } from './propertyTree';
import { connection } from './connection';
import { version } from './version';
// import logger from './logger';

const middleware = applyMiddleware(
  // logger, //middleWare for logging state change
  updateBackend,
  connection,
  version
);

export default middleware;
