import PropTypes from 'prop-types';
import React from 'react';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import styles from '../Climate/Button.scss';

const NextStepButton = ({next, NextStepId, string, setShowStory }) => (
  <div className={styles.next} onClick={next} >

    <SmallLabel>{string}</SmallLabel>
  </div>
);

NextStepButton.propTypes = {
  setShowStory: PropTypes.number.isRequired,
  storyStep: PropTypes.number.isRequired,
  next: PropTypes.func.isRequired,
};

export default NextStepButton;
