import React from 'react';
import PropTypes from 'prop-types';

import SmallLabel from '../../common/SmallLabel/SmallLabel';

import MarkerInfoIcon from './MarkerInfoIcon';

import styles from './MarkerInfo.scss';

function MarkerInfo({
  position, size, showInfoIcon, identifier, showLabel, offset, infoText
}) {
  const positionStyles = {
    MarkerInfo: {
      left: `${Number(position[0])}px`,
      bottom: `calc(${Number(position[1])}px + ${offset}px)`
    },
    Icon: {
      fontSize: `${size}em`
    },
    Text: {
      fontSize: `${size / 2}em`
    }
  };

  return (
    <div className={styles.MarkerInfo} style={positionStyles.MarkerInfo}>
      {showInfoIcon && (
        <MarkerInfoIcon
          identifier={identifier}
          positionStyles={positionStyles}
          infoText={infoText}
        />
      )}
      {showLabel && (
        <SmallLabel style={positionStyles.Text}>
          {identifier}
        </SmallLabel>
      )}
    </div>
  );
}

MarkerInfo.propTypes = {
  position: PropTypes.array,
  identifier: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  showInfoIcon: PropTypes.bool.isRequired,
  infoText: PropTypes.string.isRequired,
  showLabel: PropTypes.bool.isRequired,
  offset: PropTypes.number.isRequired
};

MarkerInfo.defaultProps = {
  position: ''
};

export default MarkerInfo;
