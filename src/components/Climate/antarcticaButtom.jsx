import PropTypes from 'prop-types';
import React from 'react';
import styles from './Buttom.scss';
import Icon from '../common/MaterialIcon/MaterialIcon';

const AntarcticaButtom = ( {props} ) => (
  <div className={styles.antarctica} onClick=props >
    <h2>{props}</h2>
    <Icon icon="ac_unit" className={styles.Icon} />
  </div>
);

AntarcticaButtom.propTypes = {
  props: PropTypes.func.isRequired,
};

export default AntarcticaButtom;


const Post = (props) => {
  return (
    <div>
      <h2>{props.content}</h2>
      <h4> username: {props.user}</h4>
    </div>
  );
};
