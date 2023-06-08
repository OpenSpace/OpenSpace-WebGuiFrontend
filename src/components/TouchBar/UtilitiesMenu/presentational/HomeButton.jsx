import React from 'react';
import { Icon } from '@iconify/react';
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
      <Icon icon="material-symbols:home" className={styles.Icon} />
      <SmallLabel>Home</SmallLabel>
    </div>
  );
}

HomeButton.propTypes = {
  handleClick: PropTypes.func.isRequired
};

export default HomeButton;
