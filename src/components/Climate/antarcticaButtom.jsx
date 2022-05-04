import PropTypes from 'prop-types';
import React from 'react';
import styles from './Buttom.scss';
import Icon from '../common/MaterialIcon/MaterialIcon';
const AntarcticaButtom = ( props ) => (
  <div className={styles.antarctica} onClick={props} >
    <h4>info: {props.info}</h4>
    <Icon icon="ac_unit" className={styles.Icon} />
  </div>
);

AntarcticaButtom.propTypes = {
  antarctica: PropTypes.func.isRequired,
};

export default AntarcticaButtom;
