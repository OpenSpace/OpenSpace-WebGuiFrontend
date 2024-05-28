import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
/* eslint-disable import/no-webpack-loader-syntax */

import {
  subscribeToCameraPath,
  subscribeToEngineMode,
  unsubscribeToCameraPath,
  unsubscribeToEngineMode,
  subscribeToSessionRecording,
  unsubscribeToSessionRecording
} from '../../../../api/Actions';

import {
  EngineModeCameraPath,
  EngineModeSessionRecordingPlayback,
  EngineModeUserControl,
  NavigationAimKey,
  NavigationAnchorKey,
  ScenePrefixKey,
  SessionStatePaused,
  SessionStatePlaying
} from '../../../../api/keys';
import propertyDispatcher from '../../../../api/propertyDispatcher';
import Picker from '../../../BottomBar/Picker';
import styles from './OriginPicker.scss';
import { AnchorAndAimPicker, CameraPathPicker, FocusPicker } from './OriginFunctions';

interface Property {
  value?: string;
}

interface PropertyOwner {
  name: string;
}

interface State {
  engineMode: {
    mode?: string;
  };
  luaApi: any;
  propertyTree: {
    properties: Record<string, Property>;
    propertyOwners: Record<string, PropertyOwner>;
  };
  sessionRecording: {
    recordingState: string;
  };
  cameraPath: {
    target?: string;
    remainingTime: number;
  };
}

function OriginPicker() {
  const engineMode = useSelector((state: State) => state.engineMode.mode || EngineModeUserControl);
  const luaApi = useSelector((state: State) => state.luaApi);

  const anchor = useSelector((state: State) => {
    const anchorProp = state.propertyTree.properties[NavigationAnchorKey];
    return anchorProp && anchorProp.value;
  });
  const anchorName = useSelector((state: State) => {
    const anchorNode = state.propertyTree.propertyOwners[ScenePrefixKey + anchor];
    return anchorNode ? anchorNode.name : anchor || '';
  });
  const aim = useSelector((state: State) => {
    const aimProp = state.propertyTree.properties[NavigationAimKey];
    return aimProp && aimProp.value;
  });
  const aimName = useSelector((state: State) => {
    const aimNode = state.propertyTree.propertyOwners[ScenePrefixKey + aim];
    return aimNode ? aimNode.name : aim || '';
  });

  const sessionRecordingState = useSelector(
    (state: State) => state.sessionRecording.recordingState
  );

  // Camera path information
  const pathTargetNode = useSelector((state: State) => state.cameraPath.target);
  const pathTargetNodeName = useSelector((state: State) => {
    const node = state.propertyTree.propertyOwners[ScenePrefixKey + pathTargetNode];
    return node ? node.name : pathTargetNode;
  });
  const remainingTimeForPath = useSelector((state: State) => state.cameraPath.remainingTime);
  // @ TODO: Use this, sometime, to communicate when a path is paused
  // const isPathPaused = useSelector((state) => state.cameraPath.isPaused);

  const dispatch = useDispatch();
  // Use refs so these aren't recalculated each render and trigger useEffect
  const anchorDispatcher = React.useRef(propertyDispatcher(dispatch, NavigationAnchorKey));
  const aimDispatcher = React.useRef(propertyDispatcher(dispatch, NavigationAimKey));

  // const cappedAnchorName = anchorName?.substring(0, 20);

  React.useEffect(() => {
    dispatch(subscribeToSessionRecording());
    dispatch(subscribeToEngineMode());
    dispatch(subscribeToCameraPath());
    return () => {
      dispatch(unsubscribeToSessionRecording());
      dispatch(unsubscribeToEngineMode());
      dispatch(unsubscribeToCameraPath());
    };
  }, []);

  React.useEffect(() => {
    anchorDispatcher.current.subscribe();
    return () => anchorDispatcher.current.unsubscribe();
  }, [anchorDispatcher.current]);

  React.useEffect(() => {
    aimDispatcher.current.subscribe();
    return () => aimDispatcher.current.unsubscribe();
  }, [aimDispatcher.current]);

  function hasDistinctAim() {
    return aim !== '' && aim !== anchor;
  }

  function pickerContent() {
    if (engineMode === EngineModeCameraPath) {
      return (
        <CameraPathPicker
          pathTargetNodeName={pathTargetNodeName || 'defaultName'}
          remainingTimeForPath={remainingTimeForPath}
          anchorName={anchorName}
          onCancelFlight={() => luaApi.pathnavigation.stopPath()}
        />
      );
    }
    return hasDistinctAim() ? (
      <AnchorAndAimPicker anchorName={anchorName} aimName={aimName} />
    ) : (
      <FocusPicker anchorName={anchorName} />
    );
  }

  // OBS same as timepicker
  function pickerStyle() {
    const isSessionRecordingPlaying =
      engineMode === EngineModeSessionRecordingPlayback &&
      sessionRecordingState === SessionStatePlaying;

    const isSessionRecordingPaused =
      engineMode === EngineModeSessionRecordingPlayback &&
      sessionRecordingState === SessionStatePaused;

    const isCameraPathPlaying = engineMode === EngineModeCameraPath;

    if (isSessionRecordingPaused) {
      // TODO: add camera path paused check
      return Picker.DisabledOrange;
    }
    if (isCameraPathPlaying) {
      return Picker.Blue;
    }
    if (isSessionRecordingPlaying) {
      return Picker.DisabledBlue;
    }
    return '';
  }

  const enabled = engineMode === EngineModeUserControl;

  const pickerClasses = [styles.originPicker, enabled ? '' : pickerStyle()].join(' ');

  return (
    <div className={Picker.Wrapper}>
      <Picker refKey='Origin' className={pickerClasses}>
        {pickerContent()}
      </Picker>
    </div>
  );
}

export default OriginPicker;
