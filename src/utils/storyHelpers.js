import { setDate } from './timeHelpers';
import { StoryTagKey } from './../api/keys'

// Function to set the time and location for the start of a story
export const setStoryStart = (luaApi, startPosition, startTime, overviewLimit) => {
  luaApi.globebrowsing.goToGeo( 
    startPosition.latitude, 
    startPosition.longitude,
    startPosition.altitude
  );

  setDate(luaApi, startTime);

  luaApi.setPropertyValue(`NavigationHandler.OrbitalNavigator.StoryOverviewLimit`, overviewLimit);
};

export const addStoryTags= (luaApi, nodes) => {
  nodes.forEach(node => {
    luaApi.addTag(node, StoryTagKey);
  });
};

export const removeStoryTags = (luaApi, nodes) => {
  nodes.forEach(node => {
    luaApi.removeTag(node, StoryTagKey);
  });
};

// Function to toggle the shading on a planet, value = 'true' equals shading enabled
export const toggleShading = (luaApi, planet, value) => {
  luaApi.setPropertyValue(`Scene.${planet}.Renderable.PerformShading`, value);
};

// Function to toggle high resolution data for a planet, data of type CTX_Mosaic
// value = 'true' equals high resolution data enabled
export const toggleHighResolution = (luaApi, planet, value) => {
  luaApi.setPropertyValue(`Scene.${planet}.Renderable.Layers.ColorLayers.CTX_Mosaic_Utah.Enabled`, value);
};

// Function to toggle the visibility of a planet,
// value = 'true' equals the planet being visible and not hidden
export const toggleHidePlanet = (luaApi, planet, value) => {
  luaApi.setPropertyValue(`Scene.${planet}.Renderable.Enabled`, value);
  luaApi.setPropertyValue(`Scene.${planet}Trail.Renderable.Enabled`, value);
  luaApi.setPropertyValue(`Scene.${planet}.ScreenVisibility`, value);
};

// Function to toggle the visibility of galaxies, value = 'true' equals galaxies enabled
export const toggleGalaxies = (luaApi, value) => {
  luaApi.setPropertyValue(`Scene.SloanDigitalSkySurvey.Renderable.Enabled`, value);
  luaApi.setPropertyValue(`Scene.TullyGalaxies.Renderable.Enabled`, value);
};

// Function to zoom out once a story is picked, value = 'true' equals overview enabled,
// and a slower velocity is used
export const toggleZoomOut = (luaApi, value) => {
  const velocity = value ? 0.02 : 0.04;
  luaApi.setPropertyValue(`NavigationHandler.OrbitalNavigator.VelocityZoomControl`, velocity);
  luaApi.setPropertyValue(`NavigationHandler.OrbitalNavigator.Overview`, value);
};

// Function to hide logs and information on screen.
// The distance from camera to focus will still be displayed.
export const hideDevInfoOnScreen = (luaApi, value) => {
  luaApi.setPropertyValue(`RenderEngine.ShowVersion`, !value);
  luaApi.setPropertyValue(`RenderEngine.ShowCamera`, !value);
  luaApi.setPropertyValue(`RenderEngine.ShowLog`, !value);
  luaApi.setPropertyValue(`Dashboard.Date.Enabled`, !value);
  luaApi.setPropertyValue(`Dashboard.SimulationIncrement.Enabled`, !value);
  luaApi.setPropertyValue(`Dashboard.Framerate.Enabled`, !value);
  luaApi.setPropertyValue(`Dashboard.ParallelConnection.Enabled`, !value);
  luaApi.setPropertyValue(`Dashboard.Distance.StoryStyleActive`, value);
};

// Function to show or hide distance from camera to focus on screen.
export const showDistanceOnScreen = (luaApi, value) => {
  luaApi.setPropertyValue(`Dashboard.Distance.Enabled`, value);
};

/**
* This function helps verifying the input values of the json file
* and also converts where appropriate, for example the json date
* strings are converted into javascript Date objects
* @param story - the selected story identifier
*/ 
export const storyFileParser = (story) => {

  const json = require(`../stories/story_${story}.json`);
  //TODO: Loop through all items and verify their format and type
  let parsedJSON = json;

  //The strings from the json files are assumed to be UTC
  //unless specified as 'NOW'
  const startDateString = json.start.date;
  let startDate = undefined;
  if(startDateString === "NOW"){
   startDate = new Date();
  }else{
    startDate = new Date(startDateString);
  }
  parsedJSON.start.date = startDate;

  return parsedJSON;
}

export const infoFileParser = (infoFile) => {

  const info = require(`../stories/${infoFile}.json`);
  let parsedInfo = info;

  return parsedInfo;

}
