import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { subscribeToTime, unsubscribeToTime } from '../../../../api/Actions';
import {
  FastForward, FastRewind, Forward, Play, Rewind
} from '../../../../api/keys';
import * as timeHelpers from '../../../../utils/timeHelpers';
import LoadingString from '../../../common/LoadingString/LoadingString';
import Icon from '../../../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';

import styles from '../style/TimeController.scss';
import buttonStyles from '../style/UtilitiesButtons.scss';

const FastSpeed = 86400;
const Speed = 3600;

function TimePlayerController() {
  const luaApi = useSelector((state) => state.luaApi);
  const time = useSelector((state) => state.time.time);
  const deltaTime = useSelector((state) => state.time.deltaTime);
  const isPaused = useSelector((state) => state.time.isPaused);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(subscribeToTime());
    return () => {
      dispatch(unsubscribeToTime());
    };
  }, []);

  function setSimulationSpeed(speed) {
    timeHelpers.UpdateDeltaTimeNow(luaApi, speed);
  }

  function clickPlayer(e) {
    switch (e.target.id) {
      case FastRewind:
        luaApi.time.setPause(false);
        setSimulationSpeed(-FastSpeed);
        break;
      case Rewind:
        luaApi.time.setPause(false);
        setSimulationSpeed(-Speed);
        break;
      case Play:
        if (isPaused) {
          luaApi.time.setPause(false);
          setSimulationSpeed(1);
        } else {
          luaApi.time.setPause(true);
          setSimulationSpeed(0);
        }
        break;
      case Forward:
        luaApi.time.setPause(false);
        setSimulationSpeed(Speed);
        break;
      case FastForward:
        luaApi.time.setPause(false);
        setSimulationSpeed(FastSpeed);
        break;
      default:
        break;
    }
  }

  return (
    <div className={styles.TimeController}>
      <div className={styles.ButtonContainer}>
        <div
          className={buttonStyles.UtilitiesButton}
          onClick={() => timeHelpers.setDateToNow(luaApi)}
          role="button"
          tabIndex="0"
        >
          <Icon icon="replay" className={styles.Icon} />
          <SmallLabel>Time</SmallLabel>
        </div>
      </div>
      <div className={styles.SimulationIncrement}>
        <div className={styles.TimeText}>
          <LoadingString loading={time === undefined}>
            {time && time.toUTCString()}
          </LoadingString>
        </div>
        <div className={styles.PlayerContainer}>
          <Icon
            icon="fast_rewind"
            id={FastRewind}
            className={`${styles.Icon} ${(deltaTime === -FastSpeed) && styles.active}`}
            onClick={clickPlayer}
          />
          <Icon
            icon="fast_rewind"
            id={Rewind}
            className={`${styles.Icon} ${(deltaTime === -Speed) && styles.active}`}
            onClick={clickPlayer}
          />
          <Icon
            icon={isPaused ? 'pause' : 'play_arrow'}
            id={Play}
            className={`${styles.Icon} ${(deltaTime === 0 || deltaTime === 1) && styles.active}`}
            onClick={clickPlayer}
          />
          <Icon
            icon="fast_forward"
            id={Forward}
            className={`${styles.Icon} ${(deltaTime === Speed) && styles.active}`}
            onClick={clickPlayer}
          />
          <Icon
            icon="fast_forward"
            id={FastForward}
            className={`${styles.Icon} ${(deltaTime === FastSpeed) && styles.active}`}
            onClick={clickPlayer}
          />
        </div>
      </div>
    </div>
  );
}

export default TimePlayerController;
