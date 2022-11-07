import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Input/Button/Button';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import SkyBrowserInfoBox from './SkyBrowserInfoBox';
import styles from './SkyBrowserFocusEntry.scss';
import { LazyLoadImage } from "react-lazy-load-image-component";

function OpacitySlider({ opacity, setOpacity, identifier }) {
  function handleChange(e) {
    // Ensure the image has an id, which consists of the index of the image
    const index = Number(identifier);
    const opacity = event.target.value / 100;
    if (index) {
      setOpacity(index, opacity);
    }
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
  }

  return (
    <div className={styles.slidecontainer}>
      <input
        type="range"
        min="0"
        max="100"
        value={opacity * 100}
        className={styles.slider}
        onChange={handleChange}
      />
      {' '}
    </div>
  );
}

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
  name,
  onSelect,
  opacity,
  ra,
  removeImageSelection,
  setOpacity,
  thumbnail
}) {

  // The function setOpacity is only sent to the tab entries
  // Therefore, if the setOpacity function is defined, we are dealing with
  // a tab entry
  const isTabEntry = Boolean(setOpacity); 
  
  function select(e) {
    if (onSelect && identifier) {
      onSelect(identifier);
    }
    // Check if there is an event - otherwise choose the event of the window
    let event = e ?? window.event;
    event.cancelBubble = true;
    event?.stopPropagation();
  }

  return (
      <li
        className={`${styles.entry} ${isTabEntry && styles.tabEntry} ${isActive && styles.active}`}
        style={{ borderLeftColor: currentBrowserColor() }}
        onMouseOver={() => { luaApi.skybrowser.moveCircleToHoverImage(Number(identifier)); }}
        onMouseOut={() => { luaApi.skybrowser.disableHoverCircle(); }}
        onClick={isTabEntry ? undefined : select}
      >
        {isTabEntry && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={(e) => {
              if (!e) var e = window.event;
              e.cancelBubble = true;
              if (e.stopPropagation) e.stopPropagation();
              removeImageSelection(identifier);
            }}
            className={styles.removeImageButton}
            transparent
            small
          >
            <MaterialIcon icon="close" className="small" />
          </Button>
        </div>
        )}
        <div className={styles.image}>
          <LazyLoadImage src={thumbnail} alt={''} className={styles.imageText} onClick={setOpacity ? select : undefined}/>
        </div>
        <div className={styles.imageHeader}>
          <span className={styles.imageTitle}>
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
        {isTabEntry && (
          <OpacitySlider setOpacity={setOpacity} opacity={opacity} identifier={identifier} />
        )}
        {(!isTabEntry && !hasCelestialCoords) && (
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
  opacity: PropTypes.number,
  ra: PropTypes.number,
  removeImageSelection: PropTypes.func,
  setOpacity: PropTypes.func,
  thumbnail: PropTypes.string,
};

SkyBrowserFocusEntry.defaultProps = {
  isActive: false,
  onSelect: null,
};

export default SkyBrowserFocusEntry;
