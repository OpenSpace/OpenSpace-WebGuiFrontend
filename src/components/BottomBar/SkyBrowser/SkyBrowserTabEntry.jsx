import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import PropTypes from 'prop-types';

import Button from '../../common/Input/Button/Button';
import NumericInput from '../../common/Input/NumericInput/NumericInput';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';

import SkyBrowserInfoBox from './SkyBrowserInfoBox';

import styles from './SkyBrowserEntry.scss';

function OpacitySlider({ opacity, setOpacity, identifier }) {
  function handleChange(newValue) {
    // Ensure the image has an id, which consists of the index of the image
    const index = Number(identifier);
    if (index) {
      setOpacity(index, newValue);
    }
  }
  return (
    <div className={styles.sliderContainer}>
      <NumericInput
        type="range"
        min={0}
        max={1}
        placeholder="Opacity"
        step={0.01}
        label="Opacity"
        value={opacity}
        onValueChanged={handleChange}
        decimals={2}
      />
    </div>
  );
}

function SkyBrowserFocusEntry({
  credits,
  creditsUrl,
  currentBrowserColor,
  dragHandleTitleProps,
  dec,
  fov,
  hasCelestialCoords,
  identifier,
  isActive,
  luaApi,
  moveCircleToHoverImage,
  name,
  onSelect,
  opacity,
  ra,
  removeImageSelection,
  setOpacity,
  thumbnail
}) {
  function select(e) {
    if (onSelect && identifier) {
      onSelect(identifier);
    }
  }

  return (
    <li
      className={`${styles.entry} ${styles.tabEntry} ${isActive && styles.active}`}
      style={{ borderLeftColor: currentBrowserColor() }}
      onMouseOver={() => { moveCircleToHoverImage(identifier); }}
      onMouseOut={() => { luaApi.skybrowser.disableHoverCircle(); }}
      onClick={select}
      {...dragHandleTitleProps}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={styles.image}>
          <LazyLoadImage src={thumbnail} alt="" className={styles.imageText} onClick={select} />
        </div>
        {!hasCelestialCoords && (
          <span className={styles.skySurvey}>
            Sky Survey
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
        <div className={styles.imageTitle} style={{ maxWidth: '150px' }}>
          { name || identifier }
        </div>
        <OpacitySlider setOpacity={setOpacity} opacity={opacity} identifier={identifier} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 'auto' }}>
        <SkyBrowserInfoBox
          className={styles.removeImageButton}
          dec={dec}
          fov={fov}
          hasCelestialCoords={hasCelestialCoords}
          infoPlacement="left"
          ra={ra}
          style={{ display: 'flex', justifyContent: 'center', borderRadius: '4px' }}
          text={credits}
          textUrl={creditsUrl}
          title={(name || identifier)}
        />
        <Button
          onClick={(e) => {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            removeImageSelection(identifier);
          }}
          className={styles.removeImageButton}
          small
          transparent
        >
          <MaterialIcon icon="delete" className="small" />
        </Button>
      </div>
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
  opacity: PropTypes.number,
  ra: PropTypes.number,
  removeImageSelection: PropTypes.func,
  setOpacity: PropTypes.func,
  thumbnail: PropTypes.string
};

SkyBrowserFocusEntry.defaultProps = {
  isActive: false,
  onSelect: null
};

export default SkyBrowserFocusEntry;
