import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import subStateToProps from '../../utils/subStateToProps';
import { Rnd as ResizeableDraggable } from 'react-rnd';
import Property from '../Sidebar/Properties/Property'
import styles from './TourPopup.scss';
import contents from './GettingStartedContent.json'
import Button from '../common/Input/Button/Button'

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
      style={{ transform: `rotate(${degrees}deg)`, bottom: `${position.y}px`, left: `${position.x}px` }}
      {...props} >
      <div ref={arrowRef} className={styles.arrow}></div>
    </div>);
}

function TourPopup({ properties }) {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const content = contents[currentSlide];
  const property = properties[content.uri];
  const uriCondition = content.value === property?.value;

  return <>
    <AnimatedArrow rotation={content.arrowRotation} position={content.arrowPosition}/>
    <ResizeableDraggable
        default={{
          x: content.position.x,
          y: content.position.y,
          width: content.size.width,
          height: content.size.height,
        }}
        minWidth={300}
        minHeight={200}
      bounds="window"
      className={styles.content}
      >
      <h1 className={styles.title}>{ content.title }</h1>
      <p className={styles.text}>{content.firstText}</p>
      {uriCondition && <p className={styles.text}>{content.secondText}</p>}
      <div className={styles.buttonContainer}>
        <Button
          onClick={() => setCurrentSlide(currentSlide + 1)}
          disabled={!(uriCondition && currentSlide < contents.length - 1)}
        >
          Next
        </Button>
    </div>
    </ResizeableDraggable>
    </>;
}

TourPopup.propTypes = {
};

TourPopup.defaultProps = {
};

const mapStateToSubState = (state) => ({
  properties: state.propertyTree.properties,
});

const mapSubStateToProps = ({ properties }) => {
  return {
    properties: properties,
  };
};

TourPopup = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState)
)(TourPopup);

export default TourPopup;