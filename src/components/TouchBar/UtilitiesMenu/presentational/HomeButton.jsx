import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../common/Icon/Icon';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';
import styles from './../style/UtilitiesButtons.scss';

const HomeButton = props => (
  <div
    /*className={`${styles.UtilitiesButton} ${this.isActive && styles.active}`}*/
    className={`${styles.UtilitiesButton} ${styles.active}`}
    onClick={props.handleClick}
    role="button"
    tabIndex="0"
  >
    <Icon icon="home" className={styles.Icon} />
    <SmallLabel>Home</SmallLabel>
  </div>
);

HomeButton.propTypes = {
  handleClick: PropTypes.func.isRequired,
};

export default HomeButton;
