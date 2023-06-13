import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useSelector } from 'react-redux';
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
  moveCircleToHoverImage,
  name,
  onSelect,
  ra,
  thumbnail,
  style
}) {
  const luaApi = useSelector((state) => state.luaApi);

  function select() {
    if (onSelect && identifier) {
      onSelect(identifier);
    }
  }

  return (
    <div
      className={`${styles.entry} ${isActive && styles.active}`}
      style={{ borderLeftColor: currentBrowserColor(), ...style }}
      onMouseOver={() => { moveCircleToHoverImage(identifier); }}
      onFocus={() => { moveCircleToHoverImage(identifier); }}
      onMouseOut={() => { luaApi.skybrowser.disableHoverCircle(); }}
      onBlur={() => { luaApi.skybrowser.disableHoverCircle(); }}
      onClick={select}
      onKeyDown={select}
      role="button"
      tabIndex={0}
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
    </div>
  );
}

SkyBrowserFocusEntry.propTypes = {
  credits: PropTypes.string,
  creditsUrl: PropTypes.string,
  currentBrowserColor: PropTypes.func,
  dec: PropTypes.number,
  fov: PropTypes.number,
  hasCelestialCoords: PropTypes.bool.isRequired,
  identifier: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  ra: PropTypes.number,
  thumbnail: PropTypes.string,
  moveCircleToHoverImage: PropTypes.func.isRequired,
  style: PropTypes.object
};

SkyBrowserFocusEntry.defaultProps = {
  isActive: false,
  onSelect: null,
  credits: '',
  creditsUrl: '',
  currentBrowserColor: null,
  dec: 0,
  fov: 90,
  name: '',
  ra: 0,
  thumbnail: '',
  style: {}
};

export default SkyBrowserFocusEntry;
