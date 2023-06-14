import React from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import SmallLabel from '../../common/SmallLabel/SmallLabel';

import styles from './FocusButton.scss';

function OverViewButton({ onClick }) {
  return (
    <div className={styles.FocusButton} onClick={onClick} role="button" tabIndex="0">
      <Icon icon="material-symbols:track-changes" className={styles.Icon} />
      <SmallLabel>Overview</SmallLabel>
    </div>
  );
}

OverViewButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default OverViewButton;
