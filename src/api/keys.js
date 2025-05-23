// eslint-disable import/prefer-default-export

export const NavigationAnchorKey = 'NavigationHandler.OrbitalNavigator.Anchor';
export const NavigationAimKey = 'NavigationHandler.OrbitalNavigator.Aim';
export const RetargetAnchorKey = 'NavigationHandler.OrbitalNavigator.RetargetAnchor';
export const RetargetAimKey = 'NavigationHandler.OrbitalNavigator.RetargetAim';
export const RotationalFrictionKey =
  'NavigationHandler.OrbitalNavigator.Friction.RotationalFriction';
export const ZoomFrictionKey = 'NavigationHandler.OrbitalNavigator.Friction.ZoomFriction';
export const RollFrictionKey = 'NavigationHandler.OrbitalNavigator.Friction.RollFriction';

export const ApplyIdleBehaviorOnPathFinishKey =
  'NavigationHandler.PathNavigator.ApplyIdleBehaviorOnFinish';
export const CameraPathArrivalDistanceFactorKey =
  'NavigationHandler.PathNavigator.ArrivalDistanceFactor';
export const CameraPathSpeedFactorKey = 'NavigationHandler.PathNavigator.SpeedScale';
export const JumpToFadeDurationKey = 'NavigationHandler.JumpToFadeDuration';

// To get any scene graph node you need ScenePrefix+NodeIdentifier
export const ScenePrefixKey = 'Scene.';
export const SceneKey = 'Scene';

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

export const InterestingTag = 'GUI.Interesting';

// TODO: Some of the following constants are removed in master and
// should be considered deprecated

// key for getting current simulation time
export const CurrentTimeKey = 'currentTime';
// key for getting the delta time
export const DeltaTime = 'deltaTime';
// value placeholder in scripts with parameter
export const ValuePlaceholder = '___value___';
// key for json file with info for icons
export const InfoIconKey = 'info_icons';
// key for endpoint for json files
export const DataEndpointKey =
  'https://openspace.github.io/sci/mastertheses/2018/info/solarsystem/';
// key for default story
export const DefaultStory = 'default';
// key for max zoom out limit in the touch module
export const ZoomOutLimitKey = 'Modules.Touch.TouchInteraction.ZoomOutLimit';
// key for zoom in limit in the touch module
export const ZoomInLimitKey = 'Modules.Touch.TouchInteraction.ZoomInLimit';
// key for scale property
export const ScaleKey = `Scene.${ValuePlaceholder}.Scale.Scale`;
export const ScaleScreenSpaceKey = `ScreenSpace.${ValuePlaceholder}.Scale`;
// keys for timePlayerController
export const FastRewind = 'fast_rewind';
export const Rewind = 'rewind';
export const Play = 'play';
export const Forward = 'forward';
export const FastForward = 'fast_forward';
// keys for engine mode
export const EngineModeUserControl = 'user_control';
export const EngineModeSessionRecordingPlayback = 'session_recording_playback';
export const EngineModeCameraPath = 'camera_path';
// keys for session recording
export const SessionStateIdle = 'idle';
export const SessionStateRecording = 'recording';
export const SessionStatePlaying = 'playing';
export const SessionStatePaused = 'playing-paused';

// Sky browser properties
export const SkyBrowserShowTitleInBrowserKey = 'Modules.SkyBrowser.ShowTitleInGuiBrowser';
export const SkyBrowserAllowCameraRotationKey = 'Modules.SkyBrowser.AllowCameraRotation';
export const SkyBrowserCameraRotationSpeedKey = 'Modules.SkyBrowser.CameraRotationSpeed';
export const SkyBrowserTargetAnimationSpeedKey = 'Modules.SkyBrowser.TargetAnimationSpeed';
export const SkyBrowserBrowserAnimationSpeedKey = 'Modules.SkyBrowser.BrowserAnimationSpeed';
export const SkyBrowserHideTargetsBrowsersWithGuiKey =
  'Modules.SkyBrowser.HideTargetsBrowsersWithGui';
export const SkyBrowserInverseZoomDirectionKey = 'Modules.SkyBrowser.InverseZoomDirection';
export const SkyBrowserSpaceCraftAnimationTimeKey = 'Modules.SkyBrowser.SpaceCraftAnimationTime';

// OpenSpace engine
export const EnginePropertyVisibilityKey = 'OpenSpaceEngine.PropertyVisibility';
export const EngineFadeDurationKey = 'OpenSpaceEngine.FadeDuration';

// renderableTypes
export const RenderableTypes = {
  // RenderableAtmosphere: "RenderableAtmosphere",
  // RenderableBoxGrid: "RenderableBoxGrid",
  // RenderableCartesianAxes: "RenderableCartesianAxes",
  // RenderableModel: "RenderableModel",
  // RenderablePlane: "RenderablePlane",
  RenderablePlaneImageLocal: 'RenderablePlaneImageLocal',
  // RenderablePlaneImageOnline: "RenderablePlaneImageOnline",
  // RenderableSphere: "RenderableSphere",
  // RenderableSphericalGrid: "RenderableSphericalGrid",
  // RenderableTrail: "RenderableTrail",
  // RenderableTrailOrbit: "RenderableTrailOrbit",
  // RenderableTrailTrajectory: "RenderableTrailTrajectory",
  // RenderableDebugPlane: "RenderableDebugPlane",
  RenderableBillboardsCloud: 'RenderableBillboardsCloud',
  // RenderableDUMeshes: "RenderableDUMeshes",
  // RenderablePlanesCloud: "RenderablePlanesCloud",
  // RenderablePoints: "RenderablePoints",
  // RenderableGaiaStars: "RenderableGaiaStars",
  RenderableGlobe: 'RenderableGlobe',
  // RenderableConstellationBounds: "RenderableConstellationBounds",
  // RenderableRings: "RenderableRings",
  RenderableStars: 'RenderableStars'
  // RenderableCrawlingLine: "RenderableCrawlingLine",
  // RenderableFov: "RenderableFov",
  // RenderableModelProjection: "RenderableModelProjection",
  // RenderablePlaneProjection: "RenderablePlaneProjection",
  // RenderablePlanetProjection: "RenderablePlanetProjection",
  // RenderableShadowCylinder: "RenderableShadowCylinder",
  // RenderablePlaneSpout: "RenderablePlaneSpout",
  // RenderableTimeVaryingVolume: "RenderableTimeVaryingVolume",
  // RenderablePlaneImageLocal: "RenderablePlaneImageLocal",
};

// Being explicit to avoid future errors
export const LayerGroupKeys = [
  'Layers.ColorLayers',
  'Layers.HeightLayers',
  'Layers.Overlays',
  'Layers.NightLayers',
  'Layers.WaterMasks'
];

export const globeBrowsingLocationDefaultLatLon = [15.0, 10.0];
