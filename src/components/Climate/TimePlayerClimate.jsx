import React, { Component } from 'react';
import { connect } from 'react-redux';
import { subscribeToTime, unsubscribeToTime } from '../../api/Actions';
import {
  FastForward, FastRewind, Forward, Play, Rewind,
} from '../../api/keys';
import * as timeHelpers from '../../utils/timeHelpers';
import Icon from '../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import styles from '../Climate/Button.scss';
import buttonStyles from '../TouchBar/UtilitiesMenu/style/UtilitiesButtons.scss';



// const Speed = 3600; //OnTouch
//const FastSpeed = 86400; //OnTouchGui
//const FastSpeed = 10086400
//const Speed = 186400



class TimePlayerClimate extends Component {
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
    return this.props.time && this.props.time.toUTCString();
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

      case Rewind:
        luaApi.time.setPause(false);
        this.setSimulationSpeed(- this.props.timeSpeedController);
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
        this.setSimulationSpeed(this.props.timeSpeedController);
        break;

    }
  }

  render() {
    const { deltaTime, isPaused, luaApi } = this.props;


    return (
      <div className={styles.TimeController}>

        <div className={styles.SimulationIncrement}>

          <div className={styles.PlayerContainer}>

            <Icon
              icon="fast_rewind"
              id={Rewind}
              className={`${styles.IconPlay} ${(deltaTime === -this.props.timeSpeedController) && styles.active}`}
              onClick={this.clickPlayer}
            />
            <Icon
              icon={isPaused ? 'pause' : 'play_arrow'}
              id={Play}
              className={`${styles.IconPlay} ${(deltaTime === 0 || deltaTime === 1) && styles.active}`}
              onClick={this.clickPlayer}
            />
            <Icon
              icon="fast_forward"
              id={Forward}
              className={`${styles.IconPlay} ${(deltaTime === this.props.timeSpeedController) && styles.active}`}
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

TimePlayerClimate = connect(mapStateToProps, mapDispatchToProps)(TimePlayerClimate);

export default TimePlayerClimate;
