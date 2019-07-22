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
// key for getting current time subscription
export const TimeKey = 'special:currentTime';

// TODO: Some of the following constants are removed in master and
// should be considered deprecated. 

// script to toggle pause
//export const TogglePauseScript = 'openspace.time.togglePause()';
//export const InterpolateTogglePauseScript = 'openspace.time.interpolateTogglePause()';
// key for getting current simulation time
export const CurrentTimeKey = 'currentTime';
// key for getting the delta time
export const DeltaTime = 'deltaTime';
// value placeholder in scripts with parameter
export const ValuePlaceholder = '___value___';
// key for setting/getting the solarSystemOverview property
export const ApplyOverviewKey = 'NavigationHandler.OrbitalNavigator.ApplyOverview';
// key  for apply fly to trigger property
export const ApplyFlyToKey = 'NavigationHandler.OrbitalNavigator.ApplyFlyTo';
// key for json file with info for icons
export const InfoIconKey = 'info_icons';
// key for endpoint for json files
export const DataEndpointKey = 'https://openspace.github.io/sci/mastertheses/2018/info/solarsystem/';
// key for getting story identifier property
export const StoryIdentifierKey = 'Modules.WebGui.StoryHandler.StoryIdentifier';
// key for getting story interesting tag
export const StoryTagKey = 'Story.Interesting';
// key for focus nodes list property
export const FocusNodesListKey = 'Modules.WebGui.StoryHandler.FocusNodesList';
// key for default story
export const DefaultStory = 'default';
// key for overview limit
export const OverlimitKey = 'Modules.WebGui.StoryHandler.OverviewLimit';
// key for zoom in limit
export const ZoomInLimitKey = 'Modules.WebGui.StoryHandler.ZoomInLimit';
// key for scale property
export const ScaleKey = `Scene.${ValuePlaceholder}.Scale.Scale`;
// keys for timePlayerController
export const FastRewind = 'fast_rewind';
export const Rewind = 'rewind';
export const Play = 'play';
export const Forward = 'forward';
export const FastForward = 'fast_forward';
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
