import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  subscribeToEngineMode,
  subscribeToSessionRecording,
  subscribeToTime,
  unsubscribeToEngineMode,
  unsubscribeToSessionRecording,
  unsubscribeToTime
} from '../../../../../api/Actions';
import {
  EngineModeCameraPath,
  EngineModeSessionRecordingPlayback,
  EngineModeUserControl,
  SessionStatePaused,
  SessionStatePlaying
} from '../../../../../api/keys';
import LoadingString from '../../../../common/LoadingString/LoadingString';
import { useContextRefs } from '../../../../GettingStartedTour/GettingStartedContext';
import Picker from '../../../../BottomBar/Picker';

import styles from './TimePicker.scss';

import { timeLabel, speedLabel } from '../TimeUtils';
// import TimePopup from './TimePopup';

interface Property {
  value?: string;
}

interface PropertyOwner {
  name: string;
}

interface TimeState {
  time?: number;
  targetDeltaTime?: number;
  isPaused?: boolean;
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
  time: TimeState;
}

function TimePicker() {
  const refs = useContextRefs();

  const engineMode = useSelector((state: State) => state.engineMode.mode);
  const time = useSelector((state: State) => state.time.time);
  const targetDeltaTime = useSelector((state: State) => state.time.targetDeltaTime);
  const isPaused = useSelector((state: State) => state.time.isPaused);
  const sessionRecordingState = useSelector(
    (state: State) => state.sessionRecording.recordingState
  );

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(subscribeToTime());
    dispatch(subscribeToSessionRecording());
    dispatch(subscribeToEngineMode());
    return () => {
      dispatch(unsubscribeToTime());
      dispatch(unsubscribeToSessionRecording());
      dispatch(unsubscribeToEngineMode());
    };
  }, []);

  // OBS! same as origin picker
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
    if (isCameraPathPlaying || isSessionRecordingPlaying) {
      return Picker.DisabledBlue;
    }
    return '';
  }

  const enabled = engineMode === EngineModeUserControl;
  const disableClass = enabled ? '' : pickerStyle();

  const pickerClasses = [styles.timePicker, disableClass].join(' ');

  return (
    <div
      ref={(el) => {
        refs.current.Time = el;
      }}
      className={Picker.Wrapper}
    >
      <div className={pickerClasses}>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={time === undefined}>
              {timeLabel(time !== undefined ? new Date(time) : undefined)}
            </LoadingString>
          </span>
          <div>
            {targetDeltaTime === undefined ? '' : speedLabel(targetDeltaTime, isPaused || false)}
          </div>
        </div>
      </div>
    </div>
  );
}

// TimePicker.propTypes = {};

// TimePicker.defaultProps = {};

export default TimePicker;
