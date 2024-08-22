import { applyMiddleware } from 'redux';

import camera from './camera';
import cameraPath from './cameraPath';
import connection from './connection';
import documentation from './documentation';
import engineMode from './engineMode';
import events from './events';
import exoplanets from './exoplanets';
import fetchData from './fetchData';
import flightController from './flightController';
import groups from './groups';
import missions from './missions';
import propertyTree from './propertyTree';
import sessionRecording from './sessionRecording';
import shortcuts from './shortcuts';
import skybrowser from './skybrowser';
import time from './time';
import userPanels from './userPanels';
import version from './version';

const middleware = applyMiddleware(
  // logger, // middleWare for logging state change
  propertyTree,
  time,
  engineMode,
  events,
  groups,
  sessionRecording,
  connection,
  shortcuts,
  version,
  missions,
  fetchData,
  flightController,
  documentation,
  exoplanets,
  userPanels,
  skybrowser,
  camera,
  cameraPath
);

export default middleware;
