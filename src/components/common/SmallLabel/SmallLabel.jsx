import React from 'react';
import PropTypes from 'prop-types';

import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';

import styles from './SmallLabel.scss';

function SmallLabel({ children = [], refKey = undefined, ...props }) {
  const refs = refKey ? useContextRefs() : null;

  function setRef(el) {
    if (refKey) {
      refs.current[refKey] = el;
    }
  }

  return (
    <span
      ref={setRef}
      className={styles.SmallLabel}
      {...props}
    >
      { children }
    </span>
  );
}

SmallLabel.propTypes = {
  children: PropTypes.node,
  refKey: PropTypes.string
};

export default SmallLabel;
