import { applyMiddleware } from 'redux';
import { propertyTree } from './propertyTree';
import { time } from './time';
import { connection } from './connection';
import { fetchData } from './fetchData';
import { shortcuts } from './shortcuts';
import { version } from './version';
import { missions } from './missions';
import { sessionRecording } from './sessionRecording';
import { flightController } from './flightController';
import { documentation } from './documentation';
import { exoplanets } from './exoplanets';

import logger from './logger';

const middleware = applyMiddleware(
  //logger, // middleWare for logging state change
  propertyTree,
  time,
  sessionRecording,
  connection,
  shortcuts,
  version,
  missions,
  fetchData,
  flightController,
  documentation,
  exoplanets,
);

export default middleware;
