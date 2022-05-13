import PropTypes from 'prop-types';
import React from 'react';
import styles from './Button.scss';
import Icon from '../common/MaterialIcon/MaterialIcon';
const AntarcticaButton = ( props ) => (
  <div className={styles.antarctica} onClick={() => props} >
    <h4>Antarctica {props.info}</h4>
      <Icon icon="chevron_right" className={styles.Icon} />
  </div>
);

AntarcticaButton.propTypes = {
  antarctica: PropTypes.func.isRequired,
};

export default AntarcticaButton;
