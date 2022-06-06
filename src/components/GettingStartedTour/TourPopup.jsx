import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Rnd as ResizeableDraggable } from 'react-rnd';
import styles from './TourPopup.scss';
import contents from './GettingStartedContent.json'
import Button from '../common/Input/Button/Button'
import { subscribeToCamera, unsubscribeToCamera, subscribeToTime, unsubscribeToTime } from "../../api/Actions";
import openspaceLogo from "./openspace-color-transparent.png";
import MaterialIcon from "../common/MaterialIcon/MaterialIcon";

function AnimatedCheckmark({position, ...props}) {
  return <div className={`${styles.checkmarkContainer} ${styles.centerContent}`} style={position && { bottom: position.y, left: position.x }}>
  <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
    <circle className={styles.checkmark__circle} cx="26" cy="26" r="25" fill="none" />
    <path className={styles.checkmark__check} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
    </svg>
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
      style={{ transform: `rotate(${degrees}deg)`, bottom: position.y, left: position.x }}
      {...props} >
      <div ref={arrowRef} className={styles.arrow}></div>
    </div>);
}

function isConditionFulfilled(content, property, cameraPosition, valueStart, time, deltaTime) {
  let conditionIsFulfilled; 
  switch (content.goalType) {
    case 'uri':
      conditionIsFulfilled = content.value === property?.value;
      break;
    case 'geoPosition':
      let isTrue = true;
      Object.keys(content.condition).map((dimension) => {
        const { operator, value, unit } = content.condition[dimension];
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
      conditionIsFulfilled = isTrue;
      break;
    case 'time':
      if (content.changeValue === 'year') {
        conditionIsFulfilled = valueStart?.getFullYear() !== time?.getFullYear();
      }
    case 'deltaTime':
      conditionIsFulfilled = valueStart !== deltaTime;
      break;
    case 'changeUri':
      if (typeof valueStart == Number) {
        conditionIsFulfilled = !(Math.abs(valueStart - property.value) < Number.EPSILON);
      }
      else {
        conditionIsFulfilled = valueStart !== property.value;
      }
      break;
    default:
      conditionIsFulfilled = true;
      break;
    
  }
  return conditionIsFulfilled;
}

function MouseDescriptions({ button, info, description, keyboardButton}) {
  return <div className={styles.mouseDescription}>
      <p className={`${styles.text} ${styles.mouseButtonText}`}><i>{info}</i> <br /> { description }</p>
      {keyboardButton && <>
        <KeyboardButton buttonText={keyboardButton} style={{ marginLeft: '60px' }} /> 
        <p className={styles.plus}>+</p>
      </>}
      <AnimatedMouse button={button} style={keyboardButton ? { marginRight: '20px' } : { marginLeft: '60px' }}/>
  </div>;
}

function TourPopup({ properties, cameraPosition, startSubscriptions, stopSubscriptions, setVisibility, isVisible, time, targetDeltaTime }) {
  if (!isVisible) {
    return <></>;
  }
  
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [valueStart, setValueStart] = React.useState(undefined);

  //const [currentRef, setCurrentRef] = React.useState(0);
  //const [tutorial, setTutorial] = useTutorial();
  //const refs = tutorial[currentSlide];
  //const ref = refs && refs[currentRef];
  //const refCondition = Boolean(ref.current);

  const content = contents[currentSlide];
  const property = properties[content.uri];
  const isLastSlide = currentSlide === contents.length - 1;
  const isFirstSlide = currentSlide === 0;
  const conditionIsFulfilled = isConditionFulfilled(content, property, cameraPosition, valueStart, new Date(time), targetDeltaTime);

  React.useEffect(() => {
    startSubscriptions();
  }, [startSubscriptions]);

  React.useEffect(() => {
    if (content.goalType === 'time') {
      setValueStart(new Date(time));
    }
    else if (content.goalType === 'deltaTime') {
      setValueStart(targetDeltaTime);
    }
    if (content.goalType === 'changeUri') {
      setValueStart(property.value);
    }
  }, [content.goalType])

  return <>
    {Boolean(content.arrowPosition) && !conditionIsFulfilled && <AnimatedArrow rotation={content.arrowRotation} position={content.arrowPosition} />}
    <ResizeableDraggable
        default={{
          x: 500,
          y: 200,
        }}
        minWidth={500}
        minHeight={320}
      bounds="window"
      className={styles.content}
    >
      <div className={styles.spaceBetweenContent}>
      <h1 className={styles.title}>{content.title}</h1>
      <Button onClick={() => setVisibility(false)} transparent small>
        <MaterialIcon icon="close" />
        </Button>
      </div>
      {isFirstSlide && <div className={styles.centerContent}><img src={openspaceLogo} className={styles.logo} /></div>}
      <p className={styles.text}>{content.firstText}</p>
      { conditionIsFulfilled && content.goalText ?
        <AnimatedCheckmark /> : 
        <><p className={`${styles.goalText} ${styles.text}`}>{content.goalText}</p>
          {content.showMouse && content.showMouse.map(mouseData => <MouseDescriptions key={mouseData.info} {...mouseData}/>)}
        </>
      }
      {content.bulletList && content.bulletList.map(text => <li className={styles.text}>{text}</li>) }
      <div className={`${styles.buttonContainer} ${styles.spaceBetweenContent}`} style={isFirstSlide ? { justifyContent: "flex-end"} : {}}>
        {!isFirstSlide && <Button
          onClick={() => setCurrentSlide(currentSlide - 1)}
        >
          Previous
        </Button>}
        {<Button
          onClick={() => isLastSlide ? setVisibility(false) : setCurrentSlide(currentSlide + 1)}
          //disabled={!(conditionIsFulfilled && currentSlide < contents.length - 1)}
          className={`${styles.nextButton} ${styles.pulsing}`}
        >
          {!isLastSlide ? "Next" : "Finish"}
        </Button>}
    </div>
    </ResizeableDraggable>
    </>;
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
  targetDeltaTime: state.time.targetDeltaTime
});

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

TourPopup = connect(mapStateToProps, mapDispatchToProps)
  (TourPopup);

export default TourPopup;