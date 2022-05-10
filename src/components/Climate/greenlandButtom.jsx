import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../common/MaterialIcon/MaterialIcon';
import styles from './Buttom.scss';


const GreenlandButtom = ( {click} ) => (
  <div className={styles.greenland} onClick={click} >
    <Icon icon="ac_unit" className={styles.Icon} />
    <h1>greenlassnd</h1>
  </div>
);

GreenlandButtom.propTypes = {
  greenland: PropTypes.func.isRequired,
};

export default GreenlandButtom;
