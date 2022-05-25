import PropTypes from 'prop-types';
import React from 'react';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import styles from '../Climate/Button.scss';

const NextStepButton = ({increment, NextStepId }) => (
  <div className={styles.increment} onClick={increment} >

    <SmallLabel>Next!</SmallLabel>
  </div>
);

NextStepButton.propTypes = {
  storyStep: PropTypes.number.isRequired,
  increment: PropTypes.func.isRequired,
};

export default NextStepButton;
