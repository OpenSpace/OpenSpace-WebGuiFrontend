// eslint-disable import/prefer-default-export

export const NavigationAnchorKey = 'NavigationHandler.OrbitalNavigator.Anchor';
export const NavigationAimKey = 'NavigationHandler.OrbitalNavigator.Aim';
export const RetargetAnchorKey = 'NavigationHandler.OrbitalNavigator.RetargetAnchor';
export const RetargetAimKey = 'NavigationHandler.OrbitalNavigator.RetargetAim';

//To get any scene graph node you need ScenePrefix+NodeIdentifier
export const ScenePrefixKey = 'Scene.';


// key to get all scene graph nodes
// export const SceneGraphKey = '__allNodes';
// key to get all properties in openspace engine
// export const AllPropertiesKey = '__allProperties';
export const rootOwnerKey = '__rootOwner';
// export const AllScreenSpaceRenderablesKey = '__screenSpaceRenderables';
export const VersionInfoKey = 'VersionInfo';
export const SCMInfoKey = 'SCMInfo';
// script to toggle pause
export const TogglePauseScript = 'openspace.time.togglePause()';
export const InterpolateTogglePauseScript = 'openspace.time.interpolateTogglePause()';
// key for getting current time subscription
export const TimeKey = 'special:currentTime';

export const sessionStateIdle = 'idle';
export const sessionStateRecording = 'recording'
export const sessionStatePlaying = 'playing';

//renderableTypes
export const RenderableTypes = {
	// RenderableAtmosphere: "RenderableAtmosphere",
	// RenderableBoxGrid: "RenderableBoxGrid",
	// RenderableCartesianAxes: "RenderableCartesianAxes",
	// RenderableModel: "RenderableModel",
	// RenderablePlane: "RenderablePlane",
	RenderablePlaneImageLocal: "RenderablePlaneImageLocal",
	// RenderablePlaneImageOnline: "RenderablePlaneImageOnline",
	// RenderableSphere: "RenderableSphere",
	// RenderableSphericalGrid: "RenderableSphericalGrid",
	// RenderableTrail: "RenderableTrail",
	// RenderableTrailOrbit: "RenderableTrailOrbit",
	// RenderableTrailTrajectory: "RenderableTrailTrajectory",
	// RenderableDebugPlane: "RenderableDebugPlane",
	RenderableBillboardsCloud: "RenderableBillboardsCloud",
	// RenderableDUMeshes: "RenderableDUMeshes",
	// RenderablePlanesCloud: "RenderablePlanesCloud",
	// RenderablePoints: "RenderablePoints",
	// RenderableGaiaStars: "RenderableGaiaStars",
	RenderableGlobe: "RenderableGlobe",
	// RenderableConstellationBounds: "RenderableConstellationBounds",
	// RenderableRings: "RenderableRings",
	RenderableStars: "RenderableStars",
	// RenderableCrawlingLine: "RenderableCrawlingLine",
	// RenderableFov: "RenderableFov",
	// RenderableModelProjection: "RenderableModelProjection",
	// RenderablePlaneProjection: "RenderablePlaneProjection",
	// RenderablePlanetProjection: "RenderablePlanetProjection",
	// RenderableShadowCylinder: "RenderableShadowCylinder",
	// RenderablePlaneSpout: "RenderablePlaneSpout",
	// RenderableTimeVaryingVolume: "RenderableTimeVaryingVolume",
	// RenderablePlaneImageLocal: "RenderablePlaneImageLocal",
}

//being explicit to avoid future errors
export const LayerGroupKeys = ["Layers.ColorLayers", "Layers.HeightLayers",
                        "Layers.Overlays", "Layers.NightLayers",
                        "Layers.WaterMasks"];

//Temp hack until we build gui path sorting into the assets or peoperties
export const sortGroups = {
	['Planets']: {
    value: ["Mercury", "Venus",
            "Earth", "Mars", "Jupiter",
            "Saturn", "Uranus", "Neptune"]
  },
  ['Solar System']: {
    value: ["Planets", "Dwarf Planets", "Sun", "Solar System Barycenter"]
  },
}