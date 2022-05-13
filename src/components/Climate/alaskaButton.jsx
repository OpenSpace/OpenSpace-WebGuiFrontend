import PropTypes from 'prop-types';
import React from 'react';
import styles from './Button.scss';
import Icon from '../common/MaterialIcon/MaterialIcon';

/*const AlaskaButton = ({ click }) => (
  <div className={styles.greenland} onClick={click} >
  <h4>Alaska</h4>
    <Icon icon="chevron_right" className={styles.Icon} />
  </div>
);*/

const AlaskaButton = ( props ) => (
  <div className={styles.alaska} onClick={() => click} >
    <h4>Alaska {props.info}</h4>
    <Icon icon="chevron_right" className={styles.Icon} />
  </div>
)

/*AlaskaButton.propTypes = {
  alaska: PropTypes.func.isRequired,
};
*/
export default AlaskaButton;
