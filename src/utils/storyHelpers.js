import { setDate } from './timeHelpers';

// TODO evaluate flyTo vs toggleZoomOut

// Activates flying linearly to a set distance from the anchor
export const flyTo = (luaApi, distance, duration = undefined) => {
  if (typeof duration === 'number') {
    luaApi.pathnavigation.zoomToDistance(distance, duration);
    return;
  }
  luaApi.pathnavigation.zoomToDistance(distance);
};

// Function to set the time and location for the start of a story
export const setStoryStart = (luaApi, startPosition, startTime) => {


  luaApi.pathnavigation.flyToNavigationState({
    Anchor: startPosition.anchor,
    Pitch:startPosition.pitch,
    Position:startPosition.position,
    Up:startPosition.up,
    Yaw:startPosition.yaw
  });


  /*luaApi.globebrowsing.goToGeo(
    startPosition.location.latitude,
    startPosition.location.longitude,
    startPosition.location.altitude,
  );*/

setDate(luaApi, startTime);
//console.table(startPosition)
//console.log("hej" + luaApi)
};



// Function to toggle the shading on a node, value = 'true' equals shading enabled
export const toggleShading = (luaApi, node, value) => {
  luaApi.setPropertyValue(`Scene.${node}.Renderable.PerformShading`, value);
};

// Function to toggle high resolution data for a node, data of type CTX_Mosaic
// value = 'true' equals high resolution data enabled
export const toggleHighResolution = (luaApi, node, value) => {
  luaApi.setPropertyValue(`Scene.${node}.Renderable.Layers.ColorLayers.CTX_Mosaic_Utah.Enabled`, value);
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

///////// added climate /////

export const storyGetLayer = (luaApi, layer) => {
  console.log("heheh")
  luaApi.setPropertyValue(layer.URI, layer.defaultvalue);
};


export const storyGetLocation = (luaApi, position) => {

  luaApi.pathnavigation.flyToNavigationState({
    Anchor: position.anchor,
    Pitch: position.pitch,
    Position: [position.position.x,position.position.y,position.position.z],
    Up: [position.up.x,position.up.y,position.up.z],
    Yaw: position.yaw
  })
}


export const satelliteToggle = (luaApi, toggleBool) => {

  luaApi.setPropertyValue("Scene.visual.Renderable.Enabled", toggleBool); //100 brightes
  luaApi.setPropertyValue("Scene.geo.Renderable.Enabled", toggleBool); //geostationary
  luaApi.setPropertyValue("Scene.gps-ops.Renderable.Enabled", toggleBool); //gps
  //luaApi.setPropertyValue("Scene.ISS_trail.Renderable.Enabled", toggleBool); //iss Trail
  //luaApi.setPropertyValue("Scene.ISSModel.Renderable.Enabled", toggleBool); //iss Modell
  luaApi.setPropertyValue("Scene.tle-new.Renderable.Enabled", toggleBool); //Last 30days
  luaApi.setPropertyValue("Scene.stations.Renderable.Enabled", toggleBool); //Spacestation

};

export const storyGetIdleBehavior = (luaApi, scrollValue)=>{
  luaApi.setPropertyValue("NavigationHandler.OrbitalNavigator.IdleBehavior.ApplyIdleBehavior", true);
  luaApi.setPropertyValue("NavigationHandler.OrbitalNavigator.IdleBehavior.IdleBehavior", scrollValue);

};

export const storyResetLayer = (luaApi) => {

  luaApi.setPropertyValue("Scene.Earth.Renderable.Layers.ColorLayers.*.Enabled", false);
  luaApi.setPropertyValue("Scene.Earth.Renderable.Layers.Overlays.*.Enabled", false);

};



/////////////////////////
//NavigationHandler.OrbitalNavigator.IdleBehavior.DampenInterpolationTime

/**
* This function helps verifying the input values of the json file
* and also converts where appropriate, for example the json date
* strings are converted into javascript Date objects
* @param story - the selected story identifier
*/
export const storyFileParser = (story) => {
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
  const info = require(`../stories/${infoFile}.json`);
  const parsedInfo = info;
  return parsedInfo;
};


export const storyFileParserClimate = (story) => {
  const json = require(`../story_climate/story_climate_${story}.json`);
  const parsedJSON = json;
  return parsedJSON;
};

export const infoFileParserClimate = (story) => {
  const info = require(`../story_climate/${story}.json`);
  const parsedInfo = info;
  return parsedInfo;
};
