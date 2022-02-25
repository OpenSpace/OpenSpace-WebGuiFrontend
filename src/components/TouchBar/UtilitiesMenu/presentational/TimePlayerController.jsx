import React, { Component } from 'react';
import { connect } from 'react-redux';
import { subscribeToTime, unsubscribeToTime } from '../../../../api/Actions';
import {
  FastForward, FastRewind, Forward, Play, Rewind,
} from '../../../../api/keys';
import * as timeHelpers from '../../../../utils/timeHelpers';
import Icon from '../../../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';
import styles from '../style/TimeController.scss';
import buttonStyles from '../style/UtilitiesButtons.scss';

const FastSpeed = 86400;
const Speed = 3600;

class TimePlayerController extends Component {
  constructor(props) {
    super(props);

    this.currentTimeCallback = this.currentTimeCallback.bind(this);
    this.setSimulationSpeed = this.setSimulationSpeed.bind(this);

    this.setDate = this.setDate.bind(this);
    this.clickPlayer = this.clickPlayer.bind(this);
  }

  componentDidMount() {
    this.props.startSubscription();
  }

  componentWillUnmount() {
    this.props.stopSubscription();
  }

  get time() {
    return this.props.time.toUTCString();
  }

  setDate(time) {
    timeHelpers.setDate(this.props.luaApi, time);
  }

  setSimulationSpeed(speed) {
    timeHelpers.UpdateDeltaTimeNow(this.props.luaApi, speed);
  }

  currentTimeCallback(message) {
    timeHelpers.setDate(this.props.luaApi, 2222);
    const time = new Date(timeHelpers.DateStringWithTimeZone(message.time));
    this.setState({ time });
  }

  clickPlayer(e) {
    const { isPaused, luaApi } = this.props;
    switch (e.target.id) {
      case FastRewind:
        luaApi.time.setPause(false);
        this.setSimulationSpeed(-FastSpeed);
        break;
      case Rewind:
        luaApi.time.setPause(false);
        this.setSimulationSpeed(-Speed);
        break;
      case Play:
        if (isPaused) {
          luaApi.time.setPause(false);
          this.setSimulationSpeed(1);
        } else {
          luaApi.time.setPause(true);
          this.setSimulationSpeed(0);
        }
        break;
      case Forward:
        luaApi.time.setPause(false);
        this.setSimulationSpeed(Speed);
        break;
      case FastForward:
        luaApi.time.setPause(false);
        this.setSimulationSpeed(FastSpeed);
        break;
      default:
        break;
    }
  }

  render() {
    const { deltaTime, isPaused, luaApi } = this.props;

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
            {new Date(this.time).toUTCString()}
          </div>
          <div className={styles.PlayerContainer}>
            <Icon
              icon="fast_rewind"
              id={FastRewind}
              className={`${styles.Icon} ${(deltaTime === -FastSpeed) && styles.active}`}
              onClick={this.clickPlayer}
            />
            <Icon
              icon="fast_rewind"
              id={Rewind}
              className={`${styles.Icon} ${(deltaTime === -Speed) && styles.active}`}
              onClick={this.clickPlayer}
            />
            <Icon
              icon={isPaused ? 'pause' : 'play_arrow'}
              id={Play}
              className={`${styles.Icon} ${(deltaTime === 0 || deltaTime === 1) && styles.active}`}
              onClick={this.clickPlayer}
            />
            <Icon
              icon="fast_forward"
              id={Forward}
              className={`${styles.Icon} ${(deltaTime === Speed) && styles.active}`}
              onClick={this.clickPlayer}
            />
            <Icon
              icon="fast_forward"
              id={FastForward}
              className={`${styles.Icon} ${(deltaTime === FastSpeed) && styles.active}`}
              onClick={this.clickPlayer}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    time: state.time.time,
    deltaTime: state.time.deltaTime,
    targetDeltaTime: state.time.targetDeltaTime,
    isPaused: state.time.isPaused,
    luaApi: state.luaApi
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    startSubscription: () => dispatch(subscribeToTime()),
    stopSubscription: () => dispatch(unsubscribeToTime())
  }
}

TimePlayerController = connect(mapStateToProps, mapDispatchToProps)(TimePlayerController);

export default TimePlayerController;
