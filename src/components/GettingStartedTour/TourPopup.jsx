import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import subStateToProps from '../../utils/subStateToProps';
import { Rnd as ResizeableDraggable } from 'react-rnd';
import Property from '../Sidebar/Properties/Property'
import styles from './TourPopup.scss';
import contents from './GettingStartedContent.json'
import Button from '../common/Input/Button/Button'

function TourPopup({ properties }) {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const content = contents[currentSlide];
  const property = properties[content.uri];
  console.log(currentSlide);

  if (content.value === property?.value) {
    setCurrentSlide(currentSlide + 1);
  }

  console.log(property);
  console.log(content.uri);

  return <ResizeableDraggable
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
    <p className={styles.text}>{content.text}</p>
    <div className={styles.buttonContainer}>
        <Button
          onClick={() => setCurrentSlide(currentSlide - 1)}
          disabled={!(currentSlide > 0)}
        >
          Back
        </Button>
        <Button
          style={{ alignSelf: 'flex-end', position: 'static' }}
          onClick={() => setCurrentSlide(currentSlide + 1)}
          disabled={!(currentSlide < contents.length - 1)}
        >
          Skip
        </Button>
    </div>
    </ResizeableDraggable>;
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