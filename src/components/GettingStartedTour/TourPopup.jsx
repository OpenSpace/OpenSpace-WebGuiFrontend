import React, { Component } from "react";
import PropTypes, { object } from 'prop-types';
import { connect } from 'react-redux';
import { Rnd as ResizeableDraggable } from 'react-rnd';
import styles from './TourPopup.scss';
import contents from './GettingStartedContent.json'
import Button from '../common/Input/Button/Button'
import {
  subscribeToCamera,
  unsubscribeToCamera,
  subscribeToTime,
  unsubscribeToTime,
} from "../../api/Actions";
import openspaceLogo from "./openspace-color-transparent.png";
import MaterialIcon from "../common/MaterialIcon/MaterialIcon";
import Checkbox from "../common/Input/Checkbox/Checkbox";
import {useTutorial} from "./GettingStartedContext";

function AnimatedCheckmark({...props}) {
  return <div className={styles.centerContent}>
    <div {...props}>
      <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle className={styles.checkmark__circle} cx="26" cy="26" r="25" fill="none" />
        <path className={styles.checkmark__check} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>
    </div>
  </div>;
}

function KeyboardButton({ buttonText, ...props }) {
  return <div className={`${styles.keyboardButton} ${styles.centerContent}`} {...props}>
    <p className={styles.keyboardButtonText}>{buttonText}</p>
  </div>
}

function AnimatedArrows({ ...props }) {
  return <div className={styles.arrows} {...props}>
    <div style={{ padding : '10px'}}>
      <span></span>
      <span></span>
    </div>
  </div>;
}

function useLocalStorageState(
  key,
  defaultValue = '',
  // The = {} fixes the error we would get from destructuring when no argument was passed
  // Check https://jacobparis.com/blog/destructure-arguments for a detailed explanation
  {serialize = JSON.stringify, deserialize = JSON.parse} = {},
) {
  const [state, setState] = React.useState(() => {
    const valueInLocalStorage = window.localStorage.getItem(key)
    if (valueInLocalStorage) {
      // The try/catch is here in case the localStorage value was set before
      // the serialization was in place 
      try {
        return deserialize(valueInLocalStorage)
      } catch (error) {
        window.localStorage.removeItem(key)
      }
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue
  })

  const prevKeyRef = React.useRef(key)

  React.useEffect(() => {
    const prevKey = prevKeyRef.current
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey)
    }
    prevKeyRef.current = key
    window.localStorage.setItem(key, serialize(state))
  }, [key, state, serialize])

  return [state, setState]
}

function AnimatedMouse({ button, ...props }) {
  let style = null;
  if (button === 'right') {
    style = {
      flexDirection: 'column',
      paddingTop: '0px',
      paddingBottom: '20px',
      marginRight : '20px'
    };
  }
  const rotation = button === 'right' ? [0, 180] : [-90, 90];
  return <div className={`${styles.mouseContainer} ${styles.centerContent}`} style={style}{...props}>
    <AnimatedArrows style={{ transform: `rotate(${rotation[0]}deg)` }}/>
    <div className={styles.mouse}>
      {button === 'left' && <div className={styles.leftButton}></div>}
      {button === 'right' && <div className={styles.rightButton}></div>}
      {button === 'scroll' && <div className={styles.mouseButton}></div>}
      <div className={styles.bar}></div>
      <div className={styles.verticalBar}></div>
    </div>
    <AnimatedArrows style={{ transform: `rotate(${rotation[1]}deg)` }}/>
  </div> 
}

const GoalTypes = {
  uri : "uri", 
  geoPosition : "geoPosition", 
  changeTime : "changeTime",
  changeDeltaTime : "changeDeltaTime",
  changeUri : "changeUri",
  pauseTime : "pauseTime"
}

function checkConditionsStatus(content, valueStart, currentValue) {
  let conditionsStatus = new Array(content.goalType.length); 
  content.goalType.map((goal, i) => {
    switch (goal) {
      case GoalTypes.uri:
        conditionsStatus[i] = content.uriValue === currentValue[i];
        break;
      case GoalTypes.geoPosition:
        let isTrue = true;
        Object.keys(content.position).map((dimension) => {
          const { operator, value, unit } = content.position[dimension];
          const cameraPosition = currentValue[i];
          if (unit && unit !== cameraPosition.altitudeUnit) {
            isTrue = false;
          }
          switch (operator) {
            case "<":
              isTrue = isTrue && cameraPosition[dimension] < value;
              break;
            case ">":
              isTrue = isTrue && cameraPosition[dimension] > value;
              break;
            case "between":
              const isBetween = cameraPosition[dimension] > Math.min(...value) &&
                cameraPosition[dimension] < Math.max(...value);
              isTrue = isTrue && isBetween;
              break;
            default:
              isTrue = false;
              break;
          }
        })
        conditionsStatus[i] = isTrue;
        break;
      case GoalTypes.pauseTime:
          conditionsStatus[i] = currentValue[i] === true;
          break;
      case GoalTypes.changeTime:
      case GoalTypes.changeDeltaTime:
      case GoalTypes.changeUri:
        if (!valueStart?.[i]) {
          conditionsStatus[i] = false;
          break;
        }
        if (typeof valueStart[i] === Number) {
          conditionsStatus[i] = !(Math.abs(valueStart[i] - currentValue[i]) < Number.EPSILON);
        }
        else if (typeof valueStart[i] === object) {
          let hasChanged = true;
          valueStart[i].map(channel, j => {
            hasChanged &= !(Math.abs(channel[j] - currentValue[i][j]) < Number.EPSILON);
          })
          conditionsStatus[i] = hasChanged;
        }
        else {
          conditionsStatus[i] = valueStart[i] !== currentValue[i];
        }
        break;
      default:
        conditionsStatus[i] = true;
        break;
          
    }
  });
  return conditionsStatus;
}
          
function MouseDescriptions({ button, info, description, keyboardButton}) {
  return <div className={styles.mouseDescription}>
      <p className={`${styles.text} ${styles.mouseButtonText}`}><i>{info}</i> <br /> { description }</p>
      {keyboardButton && <>
        <KeyboardButton buttonText={keyboardButton} /> 
        <p className={styles.plus}>+</p>
      </>}
      <AnimatedMouse button={button} />
  </div>;
}

function Goal({ startSubscriptions, setIsFulfilled, hasGoals, stopSubscriptions, content, currentValue}) {
  const [valueStart, setValueStart] = React.useState(undefined);
  
  // Subscribe to topics
  React.useEffect(() => {
    startSubscriptions();
    return () => stopSubscriptions();
  }, [startSubscriptions]);

  // Save start values, if the goal is to change the values
  React.useEffect(() => {
    const changeGoalTypes = [GoalTypes.changeTime, GoalTypes.changeDeltaTime, GoalTypes.changeUri];
    const changeGoals = content?.goalType?.filter(goal => changeGoalTypes.includes(goal))
    if (changeGoals?.length > 0) {
      let startValues = new Array(content.goalType.length);
      content.goalType.map((goal, i) => {
        startValues[i] = currentValue[i];
      });
      setValueStart(startValues);
    }
  }, [content]);

  // Check status of goal conditions
  const conditionsStatus = hasGoals ? checkConditionsStatus(content, valueStart, currentValue) : false;
  const areAllConditionsFulfilled = hasGoals ? !conditionsStatus.includes(false) : false;
  
  React.useEffect(() => {
    setIsFulfilled(areAllConditionsFulfilled);
  },[areAllConditionsFulfilled]);

  // Create animated click - it requires the component to be render fairly often
  const tutorial = useTutorial();
  let lastKey = null;
  const newElement = document.createElement('div');
  const animationDiv = React.useRef(newElement);
  if(content?.key && !areAllConditionsFulfilled) {
    // Find last ref that is not null
    const keyCopy = [...content.key].reverse();
    lastKey = keyCopy.find(key => Boolean(tutorial.current[key]));
  }
  
  React.useEffect(() => {
    newElement.className = styles.clickEffect;
    tutorial.current[lastKey]?.appendChild(animationDiv.current);

    return () => {
      try {
        tutorial.current[lastKey]?.removeChild(animationDiv.current);
      }
      catch(e) {
        console.error("Error: " + e);
      }
    }
  }, [content, lastKey]);  

  return (areAllConditionsFulfilled && hasGoals ?
    <AnimatedCheckmark style={{ marginTop: '70px', width: '56px', height: '56px' }} /> :
    <>{hasGoals && content.goalText.map((goal, i) => {
      return <div style={{ display: 'flex' }} key={goal}>
          <div>
            <p className={`${styles.goalText} ${styles.text}`}>{goal}</p>
          </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          {conditionsStatus[i] && <AnimatedCheckmark style={{ width: '20px', height: '20px'}}/> }
          </div>
        </div>
      }
      )}
      {content.showMouse &&
        <div className={ styles.scroll } >
          {content.showMouse.map(mouseData => <MouseDescriptions key={mouseData.info} {...mouseData} />)}
        </div>
      }
    </>
  );
}

function TourPopup({ setVisibility, isVisible }) {
  const [currentSlide, setCurrentSlide] = useLocalStorageState('currentSlide', 0);
  const [isFulfilled, setIsFulfilled] = React.useState(false);

  const content = contents[currentSlide];
  const isLastSlide = currentSlide === contents.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (isVisible && <>
    {Boolean(content.position) && !isFulfilled &&
      <div className={`${styles.animatedBorder} ${styles.geoPositionBox}`} />}
    <ResizeableDraggable
      minWidth={500}
      minHeight={350}
      bounds="window"
      className={styles.window}
    >
      <div className={styles.content} >
        <div className={styles.spaceBetweenContent}>
          <h1 className={styles.title}>{content.title}</h1>
          <Button onClick={() => setVisibility(false)} transparent small>
            <MaterialIcon icon="close" />
          </Button>
        </div>
        {isFirstSlide && <div className={styles.centerContent}>
            <img src={openspaceLogo} className={styles.logo} />
          </div>}
        <p className={styles.text}>{content.firstText}</p>
        {<p className={` ${styles.text} ${styles.infoText}`}>{content.infoText}</p>}
        <Goal content={content} setIsFulfilled={setIsFulfilled}/>
        {content.bulletList && content.bulletList.map(text => 
          <li key={text} className={styles.text}>{text}</li>
        )}
        {isLastSlide && <>
          <div style={{ display: 'flex'}}>
            <p className={styles.text}>Click 
              <Button 
                style={{ margin: '10px' }} 
                onClick={() => 
                  window.open("http://wiki.openspaceproject.com/docs/tutorials/users/", "Tutorials")
                } 
                >
                here
              </Button>
               for more in-depth tutorials</p>
          </div>
          <Checkbox 
            label={"Don't show the tutorial again"} 
            checked={true} 
            setChecked={(value) => console.log("Don't show on start")} 
            style={{marginTop: 'auto'}} 
          />
        </>}
        <div 
          className={`${styles.buttonContainer} ${styles.spaceBetweenContent}`} 
          style={isFirstSlide ? { justifyContent: "flex-end" } : {}}
        >
          {!isFirstSlide && <Button
            onClick={() => setCurrentSlide(currentSlide - 1)}
          >
            Previous
          </Button>}
          {<Button
            onClick={() => {
              if (isLastSlide) {
                setVisibility(false);
                setCurrentSlide(0);
              }
              else {
                setCurrentSlide(currentSlide + 1)
              }
            }}
            className={styles.nextButton}
            >
            {!isLastSlide ? "Next" : "Finish"}
          </Button>}
        </div>
      </div>
      <div 
        className={styles.progressBarContent} 
        style={{ 
          width: `${100 * currentSlide / (contents.length - 1)}%`, 
          borderBottomRightRadius : `${isLastSlide ? 3 : 0}px`}}
      />
    </ResizeableDraggable>
  </>)
}

TourPopup.propTypes = {
};

TourPopup.defaultProps = {
};

const mapStateToProps = (state, ownProps) => {
  const { content } = ownProps;
  const hasGoals = Boolean(content.goalType);
  let currentValue = undefined;

  if(hasGoals) {
    currentValue = new Array(content.goalType.length); 
    content.goalType.map((goal, i) => {
      switch(goal) {
        case GoalTypes.geoPosition: {
          currentValue[i] = {
            latitude: state.camera.latitude,
            longitude: state.camera.longitude,
            altitude: state.camera.altitude,
            altitudeUnit: state.camera.altitudeUnit
          }
          break;
        }
        case GoalTypes.changeDeltaTime: {
          currentValue[i] = state.time.targetDeltaTime
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
    goalType : ownProps?.content?.goalType,
    content,
    hasGoals
  }
};

const mapDispatchToProps = dispatch => ({
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
  mapDispatchToProps)
  (Goal);

export default TourPopup;