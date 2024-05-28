import React from 'react';
import { MdLock, MdLockOpen, MdViewDay } from 'react-icons/md';
import { PiHourglassBold } from 'react-icons/pi';
import { useDispatch, useSelector } from 'react-redux';
import {
  subscribeToEngineMode,
  subscribeToSessionRecording,
  subscribeToTime,
  unsubscribeToEngineMode,
  unsubscribeToSessionRecording,
  unsubscribeToTime
} from '../../../../api/Actions';

import Time from '../../../common/Input/Time/Time';
import Calendar from '../../../common/Calendar/Calendar';
import Popover from '../../../common/Popover/Popover';
import SimulationIncrement from './SimulationIncrement';
import styles from './TimePopup.scss';
import { setDate, setDateRelative, interpolateDate, interpolateDateRelative } from './TimeUtils';

interface State {
  engineMode: {
    mode?: string;
  };
  luaApi: any;
  sessionRecording: {
    recordingState: string;
  };
  time: {
    time: Date;
    targetDeltaTime: number;
    isPaused: boolean;
  };
}

const TimePopup: React.FC = () => {
  const [useLock, setUseLock] = React.useState(false);
  const [pendingTime, setPendingTime] = React.useState(new Date());
  const [showCalendar, setShowCalendar] = React.useState(false);
  const time = useSelector((state: State) => state.time.time);
  const luaApi = useSelector((state: State) => state.luaApi);

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

  const toggleLock = () => {
    setPendingTime(new Date(time));
    setUseLock(!useLock);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const realtime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const shift = e.getModifierState('Shift');

    if (shift) {
      luaApi.time.setDeltaTime(1);
    } else {
      luaApi.time.interpolateDeltaTime(1);
    }
  };

  const now = () => {
    setDate(new Date(), luaApi);
  };

  const interpolateToPendingTime = () => {
    interpolateDate(pendingTime, luaApi);
    setUseLock(false);
  };

  const setToPendingTime = () => {
    setDate(pendingTime, luaApi);
    setUseLock(false);
  };

  const resetPendingTime = () => {
    setPendingTime(new Date(time));
    setUseLock(false);
  };

  const changeDate = (event: {
    time: string;
    interpolate?: boolean;
    relative?: boolean;
    delta?: number;
  }) => {
    if (useLock) {
      setPendingTime(new Date(event.time));
    } else if (event.interpolate) {
      if (event.relative) {
        interpolateDateRelative(event.delta!, luaApi);
      } else {
        interpolateDate(new Date(event.time), luaApi);
      }
    } else if (event.relative) {
      setDateRelative(new Date(event.time), event.delta!, luaApi);
    } else {
      setDate(new Date(event.time), luaApi);
    }
  };

  const displayedTime = useLock ? pendingTime : time;

  // Define pickerStyle function if needed

  function calendar() {
    return (
      showCalendar && (
        <div>
          <hr className={Popover.styles.delimiter} />
          <Calendar currentTime={time} onChange={changeDate} todayButton />
          <hr className={Popover.styles.delimiter} />
        </div>
      )
    );
  }

  function lockOptions() {
    return (
      useLock && (
        <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
          <div onClick={interpolateToPendingTime}>Interpolate</div>
          <div onClick={setToPendingTime}>Set</div>
          <div onClick={resetPendingTime}>Cancel</div>
        </div>
      )
    );
  }

  return (
    <>
      <div className={styles.button}>
        <div className={styles.iconContainer}>
          <PiHourglassBold />
        </div>
        <span>Timeline Control</span>
      </div>
      <div
        className={Popover.styles.row}
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
      >
        <div className={styles.button} style={{ marginTop: 20 }}>
          <div
            className={`button-style ${useLock ? 'locked' : 'unlocked'}`} // Change class names as necessary
            onClick={(evt) => {
              toggleLock();
              evt.stopPropagation();
            }}
            style={{ cursor: 'pointer' }}
          >
            {useLock ? <MdLock /> : <MdLockOpen />}
            <span>Time Lock</span>
          </div>
        </div>
        {displayedTime && <Time time={displayedTime} onChange={changeDate} />}
        <div className={styles.button} style={{ marginTop: 20 }}>
          <div
            className={`button-style ${showCalendar ? 'transparent' : ''}`}
            onClick={() => toggleCalendar()}
            title='Toggle calendar'
            style={{ cursor: 'pointer' }}
          >
            <MdViewDay />
            <span>Calendar</span>
          </div>
        </div>
      </div>
      {calendar()}
      {lockOptions()}

      <div className={styles.title}>Simulation speed</div>
      <div className={Popover.styles.content}>
        <SimulationIncrement />
      </div>
      {/* <hr className={Popover.styles.delimiter} /> */}
      <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
        <div className={styles.button} onClick={realtime} style={{ cursor: 'pointer' }}>
          Realtime
        </div>
        <div className={styles.button} onClick={now} style={{ cursor: 'pointer' }}>
          Now
        </div>
      </div>
    </>
  );
};

export default TimePopup;
