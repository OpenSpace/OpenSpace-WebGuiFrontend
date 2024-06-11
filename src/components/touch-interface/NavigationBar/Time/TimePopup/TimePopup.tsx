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
} from '../../../../../api/Actions';

import Time from '../Time/Time';
import Calendar from '../../../../common/Calendar/Calendar';
import Popover from '../../../../common/Popover/Popover';
import SimulationIncrement from '../SimulationIncrement/SimulationIncrement';
import styles from './TimePopup.scss';
import { setDate, setDateRelative, interpolateDate, interpolateDateRelative } from '../TimeUtils';
import { GrClose } from 'react-icons/gr';

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
  const [showTime, setShowTime] = React.useState(false);
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
    setShowTime(!showTime);
    setPendingTime(new Date(time));
    setUseLock(!useLock);
    setShowCalendar(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
    setUseLock(false);
    setShowTime(false);
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
    setShowTime(false);
    setUseLock(false);
  };

  const setToPendingTime = () => {
    setDate(pendingTime, luaApi);
    setShowTime(false);
    setUseLock(false);
  };

  const resetPendingTime = () => {
    setPendingTime(new Date(time));
    setShowTime(false);
    setUseLock(false);
  };

  const changeDate = (event: {
    time: Date;
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
        <div className={`${Popover.styles.row} `}>
          <div className={styles.button} onClick={interpolateToPendingTime}>
            Interpolate
          </div>
          <div className={styles.button} onClick={setToPendingTime}>
            Set
          </div>
          <div className={styles.button} onClick={resetPendingTime}>
            Cancel
          </div>
        </div>
      )
    );
  }

  return (
    <>
      {/* <div className={styles.button}>
        <div className={styles.iconContainer}>
          <PiHourglassBold />
        </div>
        <span>Timeline Control</span>
      </div> */}
      {showTime && <Time time={displayedTime} onChange={changeDate} />}
      {calendar()}
      {lockOptions()}
      <div className={Popover.styles.row}>
        <div
          className={`${styles.button} button-style ${useLock ? 'locked' : 'unlocked'}`}
          onClick={(evt) => {
            toggleLock();
            evt.stopPropagation();
          }}
          style={{ cursor: 'pointer' }}
        >
          {useLock ? <MdLock /> : <MdLockOpen />}
          <span>Time Lock</span>
        </div>

        <div
          className={`${styles.button} button-style ${showCalendar ? 'transparent' : ''}`}
          onClick={() => toggleCalendar()}
          title='Toggle calendar'
          style={{ cursor: 'pointer' }}
        >
          <MdViewDay />
          <span>Calendar</span>
        </div>
      </div>

      <div className={styles.title}>Simulation speed</div>
      <div className={Popover.styles.content}>
        <SimulationIncrement />
      </div>
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
