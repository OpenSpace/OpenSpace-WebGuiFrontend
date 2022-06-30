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
  subscribeToProperty,
  unsubscribeToProperty
} from "../../api/Actions";
import { getBoolPropertyValue } from '../../utils/propertyTreeHelpers';
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
  // the = {} fixes the error we would get from destructuring when no argument was passed
  // Check https://jacobparis.com/blog/destructure-arguments for a detailed explanation
  {serialize = JSON.stringify, deserialize = JSON.parse} = {},
) {
  const [state, setState] = React.useState(() => {
    const valueInLocalStorage = window.localStorage.getItem(key)
    if (valueInLocalStorage) {
      // the try/catch is here in case the localStorage value was set before
      // we had the serialization in place (like we do in previous extra credits)
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

function isConditionFulfilled(content, property, cameraPosition, valueStart, time, isPaused, deltaTime) {
  let conditionIsFulfilled = new Array(content.goalType.length); 
  content.goalType.map((goal, i) => {
    switch (goal) {
      case GoalTypes.uri:
        conditionIsFulfilled[i] = content.uriValue === property?.value;
        break;
      case GoalTypes.geoPosition:
        let isTrue = true;
        Object.keys(content.position).map((dimension) => {
          const { operator, value, unit } = content.position[dimension];
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
        conditionIsFulfilled[i] = isTrue;
        break;
      case GoalTypes.changeTime:
        if (content.changeValue === 'year') {
          conditionIsFulfilled[i] = valueStart?.[i]?.getFullYear?.() !== time.getFullYear();
        }
        break;
      case GoalTypes.changeDeltaTime:
        conditionIsFulfilled[i] = valueStart?.[i] !== deltaTime;
        break;
      case GoalTypes.pauseTime:
        conditionIsFulfilled[i] = isPaused === true;
        break;
      case GoalTypes.changeUri:
        if (!valueStart) {
          conditionIsFulfilled[i] = false;
          break;
        }
        if (typeof valueStart[i] === Number) {
          conditionIsFulfilled[i] = !(Math.abs(valueStart[i] - property.value) < Number.EPSILON);
        }
        else if (typeof valueStart[i] === object) {
          let hasChanged = true;
          valueStart[i].map(channel, j => {
            hasChanged &= !(Math.abs(channel[j] - property.value[j]) < Number.EPSILON);
          })
          conditionIsFulfilled[i] = hasChanged;
        }
        else {
          conditionIsFulfilled[i] = valueStart[i] !== property?.value;
        }
        break;
      default:
        conditionIsFulfilled[i] = true;
        break;
          
    }
  });
  return conditionIsFulfilled;
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

function TourPopup({ isPaused, properties, cameraPosition, changeUriValues, startSubscriptions, stopSubscriptions, setVisibility, isVisible, time, targetDeltaTime }) {
  const [showTutorialOnStart, setShowTutorialOnStart] = useLocalStorageState('showTutorialOnStart', true); // To do: put in storage on disk somewhere
  const [currentSlide, setCurrentSlide] = useLocalStorageState('currentSlide', 0);
  const [valueStart, setValueStart] = React.useState(undefined);

  const content = contents[currentSlide];
  const property = properties[content.uri];
  const isLastSlide = currentSlide === contents.length - 1;
  const isFirstSlide = currentSlide === 0;
  const hasGoals = Boolean(content.goalType);

  React.useEffect(() => {
    startSubscriptions();
    return () => stopSubscriptions();
  }, [startSubscriptions]);

  // Save start values
  React.useEffect(() => {
    const changeGoalTypes = [GoalTypes.changeTime, GoalTypes.changeDeltaTime, GoalTypes.changeUri];
    const changeGoals = content?.goalType?.filter(goal => changeGoalTypes.includes(goal))
    if (changeGoals?.length > 0) {
      let startValues = new Array(content.goalType.length);
      content.goalType.map((goal, i) => {
        switch (goal) {
          case GoalTypes.changeTime:
            startValues[i] = new Date(time);
            break;
          case GoalTypes.changeDeltaTime:
            startValues[i] = targetDeltaTime;
            break;
          case GoalTypes.changeUri:
            startValues[i] = changeUriValues[content.uri];
            break;
          default:
            break;
        }
      });
      setValueStart(startValues);
    }
  }, [content]);
  
  const conditionIsFulfilled = hasGoals ? isConditionFulfilled(content, property, cameraPosition, valueStart, new Date(time), isPaused, targetDeltaTime) : false;
  const allConditionsAreFulfilled = hasGoals ? !conditionIsFulfilled.includes(false) : false;

  // Create animated click
  const tutorial = useTutorial();
  let lastKey = null;
  const newElement = document.createElement('div');
  const animationDiv = React.useRef(newElement);

  if(content?.key && !allConditionsAreFulfilled) {
    // Find last ref that is not null
    const keyCopy = [...content.key].reverse();
    lastKey = keyCopy.find(key => Boolean(tutorial.current[key]));
  }
  
  React.useEffect(() => {
    newElement.className = styles.clickEffect;
    tutorial.current[lastKey]?.appendChild(animationDiv.current);

    return () => {
      tutorial.current[lastKey]?.removeChild(animationDiv.current);
    }}, [content, lastKey]);  

  return (isVisible && <>
    {Boolean(content.position) && !allConditionsAreFulfilled &&
      <div className={`${styles.animatedBorder} ${styles.geoPositionBox}`} />}
    <ResizeableDraggable
      minWidth={400}
      minHeight={320}
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
        {isFirstSlide && <div className={styles.centerContent}><img src={openspaceLogo} className={styles.logo} /></div>}
        <p className={styles.text}>{content.firstText}</p>
        {<p className={` ${styles.text} ${styles.infoText}`}>{content.infoText}</p>}
        {allConditionsAreFulfilled && content.goalText ?
          <AnimatedCheckmark style={{ marginTop: '80px', width: '56px', height: '56px' }} /> :
          <>{hasGoals && content.goalText.map((goal, i) => {
            return <div style={{ display: 'flex' }} key={goal}>
                <div>
                  <p className={`${styles.goalText} ${styles.text}`}>{goal}</p>
                </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                {conditionIsFulfilled[i] && <AnimatedCheckmark style={{ width: '20px', height: '20px'}}/> }
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
        }
        {content.bulletList && content.bulletList.map(text => <li key={text} className={styles.text}>{text}</li>)}
        {isLastSlide && <>
          <div style={{ display: 'flex'}}>
            <p className={styles.text}>Click 
              <Button style={{ margin: '10px' }} onClick={() => window.open("http://wiki.openspaceproject.com/docs/tutorials/users/", "Tutorials")} >
                here
              </Button>
               for more in-depth tutorials</p>
          </div>
          <Checkbox label={"Don't show the tutorial again"} checked={!showTutorialOnStart} setChecked={(value) => setShowTutorialOnStart(!value)} style={{marginTop: 'auto'}} />
        </>}
        <div className={`${styles.buttonContainer} ${styles.spaceBetweenContent}`} style={isFirstSlide ? { justifyContent: "flex-end" } : {}}>
          {!isFirstSlide && <Button
            onClick={() => setCurrentSlide(currentSlide - 1)}
          >
            Previous
          </Button>}
          {<Button
            onClick={() => isLastSlide ? setVisibility(false) : setCurrentSlide(currentSlide + 1)}
            //disabled={!(conditionIsFulfilled && currentSlide < contents.length - 1)}
            className={styles.nextButton}
            >
            {!isLastSlide ? "Next" : "Finish"}
          </Button>}
        </div>
      </div>
      <div className={styles.progressBarContent} style={{ width: `${100 * currentSlide / (contents.length - 1)}%`, borderBottomRightRadius : `${isLastSlide ? 3 : 0}px`}}></div>
    </ResizeableDraggable>
  </>)
}

TourPopup.propTypes = {
};

TourPopup.defaultProps = {
};

const mapStateToProps = (state) => ({
  properties: state.propertyTree.properties,
  cameraPosition: {
    latitude: state.camera.latitude,
    longitude: state.camera.longitude,
    altitude: state.camera.altitude,
    altitudeUnit: state.camera.altitudeUnit
  },
  isPaused: state.time.isPaused,
  time: state.time.time,
  targetDeltaTime: state.time.targetDeltaTime,
  changeUriValues : { "Scene.MarsTrail.Renderable.Appearance.Color" : getBoolPropertyValue(state, "Scene.MarsTrail.Renderable.Appearance.Color")},
});

const mapDispatchToProps = dispatch => ({
  startSubscriptions: () => {
    dispatch(subscribeToCamera());
    dispatch(subscribeToTime());
    dispatch(subscribeToProperty("Scene.MarsTrail.Renderable.Appearance.Color"))
  },
  stopSubscriptions: () => {
    dispatch(unsubscribeToCamera());
    dispatch(unsubscribeToTime());
    dispatch(unsubscribeToProperty("Scene.MarsTrail.Renderable.Appearance.Color"));
  }
});

TourPopup = connect(mapStateToProps, mapDispatchToProps)
  (TourPopup);

export default TourPopup;