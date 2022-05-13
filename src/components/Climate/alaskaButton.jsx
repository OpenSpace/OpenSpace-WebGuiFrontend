import PropTypes from 'prop-types';
import React from 'react';
import styles from './Button.scss';
import Icon from '../common/MaterialIcon/MaterialIcon';
const AlaskaButton = ( {props} ) => (
  <div className={styles.alaska} onClick={() => props} >
    <h2>{props}</h2>

    <Icon icon="chevron_right" className={styles.Icon} />
  </div>
)

AlaskaButton.propTypes = {
  alaska: PropTypes.func.isRequired,
};

export default AlaskaButton;
