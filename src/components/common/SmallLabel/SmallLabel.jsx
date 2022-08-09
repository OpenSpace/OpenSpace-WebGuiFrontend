import PropTypes from 'prop-types';
import React from 'react';
import styles from './SmallLabel.scss';
import {useTutorial} from './../../GettingStartedTour/GettingStartedContext'

const SmallLabel = ({children, refKey, ...props}) => {
  const refs = refKey ? useTutorial() : null;
  return (
    <span ref={ el => refKey ? refs.current[refKey] = el : null} {...props} className={styles.SmallLabel}>
      { children }
    </span>
  );
};

SmallLabel.propTypes = {
  children: PropTypes.node,
};

SmallLabel.defaultProps = {
  children: [],
};

export default SmallLabel;
