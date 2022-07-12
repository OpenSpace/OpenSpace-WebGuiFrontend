import PropTypes from 'prop-types';
import React from 'react';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import styles from './MarkerInfo.scss';
import MarkerInfoIcon from './MarkerInfoIcon';

function MarkerInfo(props) {
  const {
    position, size, showInfoIcon, identifier, showLabel, offset, infoText,
  } = props;

  const positionStyles = {
    MarkerInfo: {
      left: `${Number(position[0])}px`,
      bottom: `calc(${Number(position[1])}px + ${offset}px)`,
    },
    Icon: {
      fontSize: `${size}em`,
    },
    Text: {
      fontSize: `${size / 2}em`,
    },
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
  offset: PropTypes.number.isRequired,
};

MarkerInfo.defaultProps = {
  position: '',
  // showInfoIcon: false, // required, so should not have default value
  // infoText: 'No info available', // required, so should not have default value
};

export default MarkerInfo;
