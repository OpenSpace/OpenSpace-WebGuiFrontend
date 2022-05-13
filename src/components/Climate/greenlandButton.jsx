import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../common/MaterialIcon/MaterialIcon';
import styles from './Button.scss';

const GreenlandButton = ({ click }) => (
  <div className={styles.greenland} onClick={() => click} >
  <h4>{click}</h4>
    <Icon icon="face" className={styles.Icon} />
  </div>
);

GreenlandButton.propTypes = {
  greenland: PropTypes.func.isRequired,
};

export default GreenlandButton;
