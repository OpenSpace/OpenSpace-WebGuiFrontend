import { applyMiddleware } from 'redux';
import { propertyTree } from './propertyTree';
import { time } from './time';
import { connection } from './connection';
import { engineMode } from './engineMode';
import { fetchData } from './fetchData';
import { shortcuts } from './shortcuts';
import { version } from './version';
import { sessionRecording } from './sessionRecording';
import { flightController } from './flightController';
import { documentation } from './documentation';
import { exoplanets } from './exoplanets';
import { skybrowser } from './skybrowser';

import logger from './logger';

const middleware = applyMiddleware(
  // logger, // middleWare for logging state change
  propertyTree,
  time,
  engineMode,
  sessionRecording,
  connection,
  shortcuts,
  version,
  fetchData,
  flightController,
  documentation,
  exoplanets,
  skybrowser,
);

export default middleware;
