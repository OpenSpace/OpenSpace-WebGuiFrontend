import PropTypes from 'prop-types';
import React from 'react';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import styles from '../Climate/Button.scss';

const NextStepButton = ({next, NextStepId,string }) => (
  <div className={styles.next} onClick={next} >

    <SmallLabel>{string}</SmallLabel>
  </div>
);

NextStepButton.propTypes = {
  storyStep: PropTypes.number.isRequired,
  next: PropTypes.func.isRequired,
};

export default NextStepButton;
