import React from 'react';
import PropTypes from 'prop-types';

import styles from './CenteredLabel.scss';

function CenteredLabel({ children, className = '', ...props}) {
  return (
    <div {...props} className={`${className} ${styles.centeredLabel}`}>
      { children }
    </div>
  );
}

CenteredLabel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default CenteredLabel;
