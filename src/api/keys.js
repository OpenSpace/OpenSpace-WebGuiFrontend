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

/*
// keys for session recording
export const SessionRecordingState = 'recState';
export const SessionRecordingFormatPlaceholder = '__format__';
export const SessionRecordingTimePlaceholder = '__time__';
export const SessionRecordingStartScript = `openspace.sessionRecording.startRecording${SessionRecordingFormatPlaceholder}("${ValuePlaceholder}")`;
export const SessionRecordingStopScript = `openspace.sessionRecording.stopRecording()`;
export const SessionPlaybackStartScript = `openspace.sessionRecording.startPlayback${SessionRecordingTimePlaceholder}("${ValuePlaceholder}")`;
export const SessionPlaybackStopScript = `openspace.sessionRecording.stopPlayback()`;
export const sessionStateIDLE = 0;
export const sessionStateRECORDING = 1;
export const sessionStatePLAYING = 2;
*/
