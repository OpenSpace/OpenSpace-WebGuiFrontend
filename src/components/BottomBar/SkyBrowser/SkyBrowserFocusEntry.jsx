import React, { Component } from 'react';
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
  isActive,
  identifier,
  setOpacity,
  onSelect,
  removeImageSelection,
  hasCelestialCoords,
  currentBrowserColor,
  opacity,
  thumbnail,
  credits,
  creditsUrl,
  ra,
  dec,
  fov,
  luaApi,
  name
}) {

  function isTabEntry() {
    return !!setOpacity;
  }

  function select(e) {
    if (onSelect && identifier) {
      onSelect(identifier);
    }
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
  }

  const imageRemoveButton = removeImageSelection && (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {skySurveyTag}
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
    );

  const opacitySlider = setOpacity ? <OpacitySlider setOpacity={setOpacity} opacity={opacity} identifier={identifier} /> : '';
  const skySurveyTag = !hasCelestialCoords ? <span className={styles.skySurvey}>
      Sky Survey
  </span> : "";
  
  return (
      <li
        className={`${styles.entry} ${isTabEntry && styles.tabEntry} ${isActive && styles.active}`}
        style={{ borderLeftColor: currentBrowserColor() }}
        onMouseOver={() => { luaApi.skybrowser.moveCircleToHoverImage(Number(identifier)); }}
        onMouseOut={() => { luaApi.skybrowser.disableHoverCircle(); }}
        onClick={setOpacity ? undefined : select}
      >
        {imageRemoveButton}
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
            isTabEntry={isTabEntry}
            hasCelestialCoords={hasCelestialCoords}
          />
        </div>
        {opacitySlider}
        {!setOpacity && skySurveyTag}
      </li>
    );
}

SkyBrowserFocusEntry.propTypes = {
  identifier: PropTypes.string.isRequired,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  isActive: PropTypes.bool,
};

SkyBrowserFocusEntry.defaultProps = {
  isActive: false,
  onSelect: null,
};

export default SkyBrowserFocusEntry;
