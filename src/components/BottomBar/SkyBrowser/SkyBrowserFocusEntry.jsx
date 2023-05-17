import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import PropTypes from 'prop-types';

import SkyBrowserInfoBox from './SkyBrowserInfoBox';

import styles from './SkyBrowserEntry.scss';

function SkyBrowserFocusEntry({
  credits,
  creditsUrl,
  currentBrowserColor,
  dec,
  fov,
  hasCelestialCoords,
  identifier,
  isActive,
  luaApi,
  moveCircleToHoverImage,
  name,
  onSelect,
  ra,
  thumbnail,
  style
}) {
  function select(e) {
    if (onSelect && identifier) {
      onSelect(identifier);
    }
  }

  return (
    <li
      className={`${styles.entry} ${isActive && styles.active}`}
      style={{ borderLeftColor: currentBrowserColor(), ...style }}
      onMouseOver={() => { moveCircleToHoverImage(identifier); }}
      onMouseOut={() => { luaApi.skybrowser.disableHoverCircle(); }}
      onClick={select}
    >
      <div className={styles.image}>
        <LazyLoadImage src={thumbnail} alt="" className={styles.imageText} />
      </div>
      <div className={styles.imageHeader}>
        <span className={styles.imageTitle} style={{ width: '80px' }}>
          { name || identifier }
        </span>
        <SkyBrowserInfoBox
          title={(name || identifier)}
          text={credits}
          textUrl={creditsUrl}
          ra={ra}
          dec={dec}
          fov={fov}
          hasCelestialCoords={hasCelestialCoords}
        />
      </div>
      {!hasCelestialCoords && (
        <span className={styles.skySurvey}>
          Sky Survey
        </span>
      )}
    </li>
  );
}

SkyBrowserFocusEntry.propTypes = {
  credits: PropTypes.string,
  creditsUrl: PropTypes.string,
  currentBrowserColor: PropTypes.func,
  dec: PropTypes.number,
  fov: PropTypes.number,
  hasCelestialCoords: PropTypes.bool,
  identifier: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  luaApi: PropTypes.object,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  ra: PropTypes.number,
  thumbnail: PropTypes.string,
  moveCircleToHoverImage: PropTypes.func
};

SkyBrowserFocusEntry.defaultProps = {
  isActive: false,
  onSelect: null
};

export default SkyBrowserFocusEntry;
