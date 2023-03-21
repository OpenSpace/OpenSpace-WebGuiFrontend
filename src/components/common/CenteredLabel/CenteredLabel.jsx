import PropTypes from 'prop-types';
import React from 'react';
import styles from './CenteredLabel.scss';

const CenteredLabel = props => (
  <div {...props} className={`${props.className} ${styles.centeredLabel}`}>
    { props.children }
  </div>
);

CenteredLabel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CenteredLabel.defaultProps = {
  className: '',
};

export default CenteredLabel;
