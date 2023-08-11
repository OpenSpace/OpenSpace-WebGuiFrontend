import React from 'react';
import { MdHome } from 'react-icons/md';
import PropTypes from 'prop-types';

import SmallLabel from '../../../common/SmallLabel/SmallLabel';

import styles from '../style/UtilitiesButtons.scss';

function HomeButton(props) {
  return (
    <div
      className={`${styles.UtilitiesButton}`}
      onClick={props.handleClick}
      role="button"
      tabIndex="0"
    >
      <MdHome className={styles.Icon} />
      <SmallLabel>Home</SmallLabel>
    </div>
  );
}

HomeButton.propTypes = {
  handleClick: PropTypes.func.isRequired
};

export default HomeButton;
