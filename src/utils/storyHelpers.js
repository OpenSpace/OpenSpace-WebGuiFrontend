import { setDate } from './timeHelpers';

// Activates flying linearly to a set distance from the anchor
export const flyTo = (luaApi, distance, duration = undefined) => {
  if (typeof duration === 'number') {
    luaApi.navigation.zoomToDistance(distance, duration);
    return;
  }
  luaApi.navigation.zoomToDistance(distance);
};

// Function to set the time and location for the start of a story
export const setStoryStart = (luaApi, startPosition, startTime) => {
  luaApi.pathnavigation.stopPath();

  luaApi?.navigation?.jumpToGeo(
    '',
    startPosition.latitude,
    startPosition.longitude,
    startPosition.altitude,
    0
  );

  setDate(luaApi, startTime);
};

// Function to toggle the shading on a node, value = 'true' equals shading enabled
export const toggleShading = (luaApi, node, value) => {
  luaApi.setPropertyValue(`Scene.${node}.Renderable.PerformShading`, value);
};

// Function to toggle high resolution data for a node, data of type CTX_Mosaic
// value = 'true' equals high resolution data enabled
export const toggleHighResolution = (luaApi, node, value) => {
  const uri = `Scene.${node}.Renderable.Layers.ColorLayers.CTX_Mosaic_Utah.Enabled`;
  luaApi.setPropertyValue(uri, value);
};

// Function to toggle the visibility of a node with a trail,
// value = 'true' equals the node being shown
export const toggleShowNode = (luaApi, node, value) => {
  luaApi.setPropertyValue(`Scene.${node}.Renderable.Enabled`, value);
  luaApi.setPropertyValue(`Scene.${node}Trail.Renderable.Enabled`, value);
  luaApi.setPropertyValue(`Scene.${node}.ScreenVisibility`, value);
};

// Function to toggle the visibility of galaxies, value = 'true' equals galaxies enabled
export const toggleGalaxies = (luaApi, value) => {
  luaApi.setPropertyValue('Scene.SloanDigitalSkySurvey.Renderable.Enabled', value);
  luaApi.setPropertyValue('Scene.TullyGalaxies.Renderable.Enabled', value);
};

// Function to show logs and information on screen.
// The distance from camera to focus will still be displayed.
export const showDevInfoOnScreen = (luaApi, value) => {
  if (value) {
    luaApi.setPropertyValue('Dashboard.StartPositionOffset', [10, -70]);
  } else {
    luaApi.setPropertyValue('Dashboard.StartPositionOffset', [10, 0]);
  }
  luaApi.setPropertyValue('RenderEngine.ShowVersion', value);
  luaApi.setPropertyValue('RenderEngine.ShowCamera', value);
  luaApi.setPropertyValue('RenderEngine.ShowLog', value);
  luaApi.setPropertyValue('Dashboard.Date.Enabled', value);
  luaApi.setPropertyValue('Dashboard.GlobeLocation.Enabled', value);
  luaApi.setPropertyValue('Dashboard.SimulationIncrement.Enabled', value);
  luaApi.setPropertyValue('Dashboard.Framerate.Enabled', value);
  luaApi.setPropertyValue('Dashboard.ParallelConnection.Enabled', value);
  luaApi.setPropertyValue('Dashboard.Distance.Enabled', value);
};

/**
* This function helps verifying the input values of the json file
* and also converts where appropriate, for example the json date
* strings are converted into javascript Date objects
* @param story - the selected story identifier
*/
export const storyFileParser = (story) => {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const json = require(`../stories/story_${story}.json`);
  // TODO: Loop through all items and verify their format and type
  const parsedJSON = json;

  // The strings from the json files are assumed to be UTC
  // unless specified as 'NOW'
  const startDateString = json.start.date;
  let startDate;
  if (startDateString === 'NOW') {
    startDate = new Date();
  } else {
    startDate = new Date(startDateString);
  }
  parsedJSON.start.date = startDate;

  return parsedJSON;
};

export const infoFileParser = (infoFile) => {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const info = require(`../stories/${infoFile}.json`);
  const parsedInfo = info;
  return parsedInfo;
};
