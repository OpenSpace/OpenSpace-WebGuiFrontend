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
import { useTutorial } from "./GettingStartedContext"; 
import MaterialIcon from "../common/MaterialIcon/MaterialIcon";
import Checkbox from "../common/Input/Checkbox/Checkbox";

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
    <span></span>
    <span></span>
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

  // Check the example at src/examples/local-state-key-change.js to visualize a key change
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
  const rotation = button === 'right' ? [180, 0] : [-90, 90];
  const marginSide = button === 'right' ? '0px': '100px';
  const offset = button === 'right' ? ['-30px', '90px'] : [null, null];
  return <div className={`${styles.mouseContainer} ${styles.centerContent}`} {...props}>
    <AnimatedArrows style={{ marginLeft: marginSide, marginTop: offset[0], transform: `rotate(${rotation[0]}deg)` }}/>
    <div className={styles.mouse}>
      {button === 'left' && <div className={styles.leftButton}></div>}
      {button === 'right' && <div className={styles.rightButton}></div>}
      {button === 'scroll' && <div className={styles.mouseButton}></div>}
      <div className={styles.bar}></div>
      <div className={styles.verticalBar}></div>
    </div>
    <AnimatedArrows style={{ marginRight: marginSide, marginTop: offset[1], transform: `rotate(${rotation[1]}deg)` }}/>
  </div> 
}

function AnimatedArrow({ rotation = 0, position, ...props }) {
  const arrowRef = React.useRef(null);
  
  let degrees = 0;
  switch (rotation) {
    case 'right':
      degrees = 0;
      break;
    case 'down':
      degrees = 90;
      break;
    case 'left':
      degrees = 180;
      break;
    case 'up':
      degrees = 270;
      break;
    default:
      degrees = rotation;
      break;
  }

  React.useEffect(() => {
    arrowRef.current.animate([
      { left: '0' },
      { left: '10px' },
      { left: '0' }
    ], {
      duration: 700,
      iterations: Infinity
    });
  }, [arrowRef])
  
  return (
    <div
      className={styles.icon}
      style={{ transform: `rotate(${degrees}deg)`, top  : position.y, left: position.x }}
      {...props} >
      <div ref={arrowRef} className={styles.arrow}></div>
    </div>);
}

function isConditionFulfilled(content, property, cameraPosition, valueStart, time, deltaTime) {
  let conditionIsFulfilled = new Array(content.goalType.length); 
  content.goalType.map((goal, i) => {
    switch (goal) {
      case 'uri':
        conditionIsFulfilled[i] = content.uriValue === property?.value;
        break;
      case 'geoPosition':
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
      case 'time':
        if (content.changeValue === 'year') {
          conditionIsFulfilled[i] = valueStart[i]?.getFullYear?.() !== time.getFullYear();
        }
        break;
      case 'deltaTime':
        conditionIsFulfilled[i] = valueStart[i] !== deltaTime;
        break;
      case 'changeUri':
        if (!valueStart) {
          console.log("INDEIFOEW", property?.value)
          conditionIsFulfilled[i] = false;
          break;
        }
        if (typeof valueStart[i] === Number) {
          conditionIsFulfilled[i] = !(Math.abs(valueStart[i] - property.value) < Number.EPSILON);
        }
        else if (typeof valueStart[i] === object) {
          console.log(valueStart[i], property.value)
          let hasChanged = true;
          console.log(valueStart[i], property.value);
          valueStart[i].map(channel, j => {
            console.log(valueStart[i], property.value);
            hasChanged &= !(Math.abs(channel[j] - property.value[j]) < Number.EPSILON);
          })
          conditionIsFulfilled[i] = hasChanged;
        }
        else {
          console.log(valueStart[i], property?.value)

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
        <KeyboardButton buttonText={keyboardButton} style={{ marginLeft: '60px' }} /> 
        <p className={styles.plus}>+</p>
      </>}
      <AnimatedMouse button={button} />
  </div>;
}

function TourPopup({ properties, cameraPosition, marsTrailColor, startSubscriptions, stopSubscriptions, setVisibility, isVisible, time, targetDeltaTime }) {
  const [showTutorialOnStart, setShowTutorialOnStart] = useLocalStorageState('showTutorialOnStart', true); // To do: put in storage on disk somewhere
  const [currentSlide, setCurrentSlide] = useLocalStorageState('currentSlide', 0);
  const [valueStart, setValueStart] = React.useState(undefined);
  const [tutorial, setTutorial] = useTutorial();

  React.useEffect(() => {
    startSubscriptions();
    return () => stopSubscriptions();
  }, [startSubscriptions]);

  const content = contents[currentSlide];
  const property = properties[content.uri];
  const isLastSlide = currentSlide === contents.length - 1;
  const isFirstSlide = currentSlide === 0;
  const hasGoals = Boolean(content.goalType);
  
  // Save start values
  React.useEffect(() => {
    if (content.goalType) {
      let startValues = new Array(content.goalType.length);
      content.goalType.map((goal, i) => {
        switch (goal) {
          case 'time':
            startValues[i] = new Date(time);
            break;
            case 'deltaTime':
              startValues[i] = targetDeltaTime;
              break;
              case 'changeUri':
                startValues[i] = marsTrailColor;
                break;
          default:
            break;
        }
      });
      setValueStart(startValues);
    }
  }, [content]);
  
  // Animated border effect between slides
  const prevIndexRef = React.useRef(0)
  const prevKeyRef = React.useRef(undefined)
  const previousIndex = prevIndexRef.current;
  const previousKey = prevKeyRef.current;

  React.useEffect(() => {
    prevIndexRef.current = 0;
  }, [content])

  React.useEffect(() => {
    const refHasChanged = previousKey !== content.key?.[previousIndex];
    if (refHasChanged) {
      tutorial[previousKey]?.current?.classList?.remove(styles.animatedBorder);
      tutorial[content?.key?.[previousIndex]]?.current?.classList?.add(styles.animatedBorder);
      prevKeyRef.current = content.key?.[previousIndex];
    }
    //console.log("previous index " + previousIndex, "previous key " + previousKey);
  }, [content, previousIndex]);
  
  // Animated border effect on the same slide
  const nextKey = content.key?.[previousIndex + 1];
  if (tutorial?.[nextKey]?.current) {
    prevIndexRef.current++;
  }
  if (!tutorial[content.key?.[previousIndex]]) {
    prevIndexRef.current--;
  }
  
  const conditionIsFulfilled = hasGoals ? isConditionFulfilled(content, property, cameraPosition, valueStart, new Date(time), targetDeltaTime) : false;
  const allConditionsAreFulfilled = hasGoals ? !conditionIsFulfilled.includes(false) : false;

  return (isVisible && <>
    {Boolean(content.arrowPosition) && !allConditionsAreFulfilled &&
      <>
      <AnimatedArrow rotation={content.arrowRotation} position={content.arrowPosition} />
      </>}
    <ResizeableDraggable
      default={{
        x: 500,
        y: 360,
      }}
      minWidth={500}
      minHeight={360}
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
  time: state.time.time,
  targetDeltaTime: state.time.targetDeltaTime,
  marsTrailColor : getBoolPropertyValue(state, "Scene.MarsTrail.Renderable.Appearance.Color"),
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