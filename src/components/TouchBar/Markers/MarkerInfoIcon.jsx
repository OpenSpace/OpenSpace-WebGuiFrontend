import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../../common/MaterialIcon/MaterialIcon';
import Popover from '../../common/Popover/Popover';

import styles from './MarkerInfo.scss';

function MarkerInfoIcon({ positionStyles, identifier, infoText }) {
  const [showInfoWindow, setShowInfoWindow] = React.useState(false);

  function toggleInfoWindow() {
    setShowInfoWindow(!showInfoWindow);
  }

  return (
    <div>
      <Icon
        onClick={() => toggleInfoWindow()}
        className={styles.Icon}
        icon="info_outline"
        style={positionStyles.Icon}
      />
      {showInfoWindow && (
        <Popover
          className={styles.InfoPopover}
          arrow=""
          title={identifier}
          closeCallback={() => toggleInfoWindow()}
        >
          <p className={styles.InfoText}>
            {infoText || 'No data available'}
          </p>
        </Popover>
      )}
    </div>
  );
}

MarkerInfoIcon.propTypes = {
  positionStyles: PropTypes.objectOf(PropTypes.shape({})).isRequired,
  identifier: PropTypes.string.isRequired,
  infoText: PropTypes.string.isRequired
};

export default MarkerInfoIcon;
