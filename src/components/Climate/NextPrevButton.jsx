import PropTypes from 'prop-types';
import React from 'react';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import styles from '../Climate/Button.scss';
import Icon from '../common/MaterialIcon/MaterialIcon';
  // console.log(iconNextPrev)
const NextStepButton = ({next, NextStepId, string, setShowStory, iconNextPrev, iconPlacement }) => (

  <div className={styles.next} onClick={next} >

    <SmallLabel>{string}</SmallLabel>
    <Icon icon= {iconNextPrev} className={styles.iconPlacement} />

  </div>

);

NextStepButton.propTypes = {

  storyStep: PropTypes.number.isRequired,
  next: PropTypes.func.isRequired,
};

export default NextStepButton;
