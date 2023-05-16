import PropTypes from 'prop-types';
import React from 'react';
import styles from './CenteredLabel.scss';

function CenteredLabel(props) {
  return (
    <div {...props} className={`${props.className} ${styles.centeredLabel}`}>
      { props.children }
    </div>
  );
}

CenteredLabel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

CenteredLabel.defaultProps = {
  className: ''
};

export default CenteredLabel;
