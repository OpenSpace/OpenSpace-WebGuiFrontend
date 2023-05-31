import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../../common/SmallLabel/SmallLabel';

import styles from './FocusButton.scss';

function OverViewButton({ onClick }) {
  return (
    <div className={styles.FocusButton} onClick={onClick} role="button" tabIndex="0">
      <Icon icon="track_changes" className={styles.Icon} />
      <SmallLabel>Overview</SmallLabel>
    </div>
  );
}

OverViewButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default OverViewButton;
