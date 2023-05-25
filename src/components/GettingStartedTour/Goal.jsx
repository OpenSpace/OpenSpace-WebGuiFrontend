import React from 'react';
import { connect } from 'react-redux';

import {
  subscribeToCamera,
  subscribeToTime,
  unsubscribeToCamera,
  unsubscribeToTime
} from '../../api/Actions';
import AnimatedCheckmark from '../common/AnimatedCheckmark/AnimatedCheckmark';

import { useContextRefs } from './GettingStartedContext';

import styles from './TourPopup.scss';

const GoalTypes = {
  uri: 'uri',
  geoPosition: 'geoPosition',
  changeTime: 'changeTime',
  changeDeltaTime: 'changeDeltaTime',
  changeUri: 'changeUri',
  pauseTime: 'pauseTime',
  multiUri: 'multiUri'
};

function checkConditionsStatus(content, valueStart, currentValue) {
  const conditionsStatus = new Array(content.goalType.length);
  content.goalType.forEach((goal, i) => {
    switch (goal) {
      case GoalTypes.uri: {
        conditionsStatus[i] = content.uriValue === currentValue[i];
        break;
      }
      case GoalTypes.geoPosition: {
        let isTrue = true;
        Object.keys(content.position).forEach((dimension) => {
          const { operator, value, unit } = content.position[dimension];
          const cameraPosition = currentValue[i];
          if (unit && unit !== cameraPosition.altitudeUnit) {
            isTrue = false;
          }
          switch (operator) {
            case '<': {
              isTrue = isTrue && cameraPosition[dimension] < value;
              break;
            }
            case '>': {
              isTrue = isTrue && cameraPosition[dimension] > value;
              break;
            }
            case 'between': {
              const isBetween = cameraPosition[dimension] > Math.min(...value) &&
                cameraPosition[dimension] < Math.max(...value);
              isTrue = isTrue && isBetween;
              break;
            }
            default: {
              isTrue = false;
              break;
            }
          }
        });
        conditionsStatus[i] = isTrue;
        break;
      }
      case GoalTypes.pauseTime: {
        conditionsStatus[i] = currentValue[i] === true;
        break;
      }
      case GoalTypes.changeTime:
      case GoalTypes.changeDeltaTime:
      case GoalTypes.changeUri: {
        if (!valueStart?.[i]) {
          conditionsStatus[i] = false;
          break;
        }
        if (typeof valueStart[i] === 'number') {
          conditionsStatus[i] = !(Math.abs(valueStart[i] - currentValue[i]) < Number.EPSILON);
        } else if (valueStart[i]?.length) {
          let hasChanged = false;
          valueStart[i].forEach((channel, j) => {
            hasChanged = hasChanged || !(Math.abs(channel - currentValue[i][j]) < Number.EPSILON);
          });
          conditionsStatus[i] = Boolean(hasChanged);
        } else {
          conditionsStatus[i] = valueStart[i] !== currentValue[i];
        }
        break;
      }
      case GoalTypes.multiUri: {
      // The multi uri will be true if either of the uris are true, equivalent to the OR operator
        let isFulfilled = false;
        currentValue[i].forEach(((value) => {
          if (content.uriValue === value.uri) {
            isFulfilled = true;
          }
        }));

        conditionsStatus[i] = isFulfilled;
        break;
      }
      default: {
        conditionsStatus[i] = true;
        break;
      }
    }
  });
  return conditionsStatus;
}

function Goal({
  startSubscriptions, setIsFulfilled, hasGoals, stopSubscriptions, content, currentValue
}) {
  const [valueStart, setValueStart] = React.useState(undefined);
  const animationDivs = React.useRef(undefined);
  const tutorial = useContextRefs();

  // Create animation click div upon startup
  React.useEffect(() => {
    const div1 = document.createElement('div');
    div1.className = styles.clickEffect;
    document.body.appendChild(div1);
    div1.style.display = 'none';

    const div2 = document.createElement('div');
    div2.className = styles.clickEffect;
    document.body.appendChild(div2);
    div2.style.display = 'none';

    animationDivs.current = [div1, div2];

    return () => {
      document.body.removeChild(div1);
      document.body.removeChild(div2);
    };
  }, []);

  // Subscribe to topics
  React.useEffect(() => {
    startSubscriptions();
    return () => stopSubscriptions();
  }, [startSubscriptions]);

  // Save start values, if the goal is to change the values
  React.useEffect(() => {
    const changeGoalTypes = [GoalTypes.changeTime, GoalTypes.changeDeltaTime, GoalTypes.changeUri];
    const changeGoals = content?.goalType?.filter((goal) => changeGoalTypes.includes(goal));
    if (changeGoals?.length > 0) {
      const startValues = new Array(content.goalType.length);
      content.goalType.forEach((goal, i) => {
        startValues[i] = currentValue[i];
      });
      setValueStart(startValues);
    }
  }, [content]);

  // Check status of goal conditions
  const currentStatus = hasGoals && checkConditionsStatus(content, valueStart, currentValue);
  const conditionsStatus = hasGoals ? currentStatus : false;
  const areAllConditionsFulfilled = hasGoals ? !conditionsStatus.includes(false) : false;

  React.useEffect(() => {
    setIsFulfilled(areAllConditionsFulfilled);
  }, [areAllConditionsFulfilled]);

  // Create animated click - it requires the component to be render fairly often
  if (animationDivs.current) {
    const slideHasClick = content?.key;
    if (slideHasClick && !areAllConditionsFulfilled) {
      // Find last ref that is not null
      const keyCopy = [...content.key].reverse();
      let lastKey = keyCopy.find((key) => {
        if (typeof key === 'object') {
          return Boolean(tutorial.current[key[0]]) && Boolean(tutorial.current[key[1]]);
        }
        return Boolean(tutorial.current[key]);
      });
      if (typeof lastKey !== 'object') {
        lastKey = [lastKey];
      }
      for (let i = 0; i < 2; i++) {
        // Get the bounding rect of the last visible ref in the slide
        const rect = tutorial.current[lastKey[i]]?.getBoundingClientRect();
        // Set the position of the animation click div
        if (rect) {
          animationDivs.current[i].style.display = 'block';
          animationDivs.current[i].style.top = `${rect.top + (rect.height * 0.5)}px`;
          animationDivs.current[i].style.left = `${rect.left + (rect.width * 0.5)}px`;
          animationDivs.current[i].style.left = `${rect.bottom - (rect.height * 0.5)}px`;
          animationDivs.current[i].style.left = `${rect.right - (rect.width * 0.5)}px`;
        } else {
          // Hide div if slide doesn't have clicks or all conditions are fulfilled
          animationDivs.current[i].style.display = 'none';
        }
      }
    } else {
      // Hide div if slide doesn't have clicks or all conditions are fulfilled
      for (let i = 0; i < 2; i++) {
        animationDivs.current[i].style.display = 'none';
      }
    }
  }

  return (areAllConditionsFulfilled && hasGoals ? (
    <div className={styles.centerContent}>
      <AnimatedCheckmark style={{ marginTop: '70px', width: '56px', height: '56px' }} />
    </div>
  ) :
    hasGoals && content.goalText.map((goal, i) => (
      <div style={{ display: 'flex' }} key={goal}>
        <div>
          <p className={`${styles.goalText} ${styles.text}`}>{goal}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {conditionsStatus[i] && <AnimatedCheckmark style={{ width: '20px', height: '20px' }} /> }
        </div>
      </div>
    ))
  );
}

const mapStateToProps = (state, ownProps) => {
  const { content } = ownProps;
  const hasGoals = Boolean(content.goalType);
  let currentValue;

  if (hasGoals) {
    currentValue = new Array(content.goalType.length);
    content.goalType.forEach((goal, i) => {
      switch (goal) {
        case GoalTypes.geoPosition: {
          currentValue[i] = {
            latitude: state.camera.latitude,
            longitude: state.camera.longitude,
            altitude: state.camera.altitude,
            altitudeUnit: state.camera.altitudeUnit
          };
          break;
        }
        case GoalTypes.changeDeltaTime: {
          currentValue[i] = state.time.targetDeltaTime;
          break;
        }
        case GoalTypes.changeTime: {
          currentValue[i] = new Date(state.time.time).getFullYear();
          break;
        }
        case GoalTypes.changeUri:
        case GoalTypes.uri: {
          currentValue[i] = state.propertyTree.properties[content.uri]?.value;
          break;
        }
        case GoalTypes.multiUri: {
          currentValue[i] = [];
          content.uri.forEach((uri) => {
            const value = state.propertyTree.properties[uri]?.value;
            if (value !== undefined) {
              currentValue[i].push(value);
            }
          });
          break;
        }
        case GoalTypes.pauseTime: {
          currentValue[i] = state.time.isPaused;
          break;
        }
        default: {
          currentValue[i] = undefined;
          break;
        }
      }
    });
  }
  return {
    currentValue,
    goalType: ownProps?.content?.goalType,
    content,
    hasGoals
  };
};

const mapDispatchToProps = (dispatch) => ({
  startSubscriptions: () => {
    dispatch(subscribeToCamera());
    dispatch(subscribeToTime());
  },
  stopSubscriptions: () => {
    dispatch(unsubscribeToCamera());
    dispatch(unsubscribeToTime());
  }
});

Goal = connect(
  mapStateToProps,
  mapDispatchToProps
)(Goal);

export default Goal;
