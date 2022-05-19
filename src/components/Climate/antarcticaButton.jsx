import PropTypes from 'prop-types';
import React from 'react';
import styles from './Button.scss';
import Icon from '../common/MaterialIcon/MaterialIcon';
//import ClimatePanel from '../BottomBar/ClimatePanel.jsx'


const AntarcticaButton = ( props ) => (
  <div className={styles.antarctica} onClick={() => props} >
    <h4>Antarctica</h4>

      <Icon icon="chevron_right" className={styles.Icon} />
  </div>
);



export default AntarcticaButton;
