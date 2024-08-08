import React from 'react';
import { MdDelete } from 'react-icons/md';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import PropTypes from 'prop-types';

import { stopEventPropagation } from '../../../utils/helpers';
import Button from '../../common/Input/Button/Button';
import NumericInput from '../../common/Input/NumericInput/NumericInput';
import propertyDispatcher from '../../../api/propertyDispatcher';
import SkyBrowserInfoBox from './SkyBrowserInfoBox';

import styles from './SkyBrowserEntry.scss';
import { disableHoverCircle, moveHoverCircle } from '../../../api/Actions';
import { useDispatch, useSelector } from 'react-redux';
import { useSubscribeToProperty } from '../../../utils/customHooks';

function OpacitySlider({ opacity, identifier }) {
  const selectedPairId = useSubscribeToProperty("Modules.SkyBrowser.SelectedPairId");
  const browserId = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.Browser`);
  const selectedImagesUrls = useSubscribeToProperty(`ScreenSpace.${browserId}.SelectedImagesUrls`) ?? [];
  const selectedImagesOpacities = useSubscribeToProperty(`ScreenSpace.${browserId}.SelectedImagesOpacities`) ?? [];

  const dispatch = useDispatch();

  function handleChange(newValue) {
    // Ensure the image has an id, which consists of the index of the image
    const index = selectedImagesUrls.indexOf(identifier);
    const newOpacities = [...selectedImagesOpacities];
    newOpacities[index] = newValue;
    propertyDispatcher(dispatch, `ScreenSpace.${browserId}.SelectedImagesOpacities`).set(newOpacities);
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

OpacitySlider.propTypes = {
  identifier: PropTypes.string.isRequired,
  opacity: PropTypes.number.isRequired,
};

function SkyBrowserTabEntry({
  url,
  dragHandleTitleProps,
  isActive,
  onSelect,
  opacity,
  removeSelection,
  borderColor
}) {
  const entry = useSelector((state) => state.skybrowser.imageList[state.skybrowser.imageMap[url]]);

  const dispatch = useDispatch();

  function select() {
    onSelect(entry.identifier);
  }

  return (
    <div
      className={`${styles.entry} ${styles.tabEntry} ${isActive && styles.active}`}
      style={{ borderLeftColor: `rgb(${borderColor})` }}
      onMouseOver={() => { dispatch(moveHoverCircle(entry.identifier)); }}
      onFocus={() => { dispatch(moveHoverCircle(entry.identifier)); }}
      onMouseOut={() => { dispatch(disableHoverCircle()); }}
      onBlur={() => { dispatch(disableHoverCircle()); }}
      onClick={select}
      onKeyPress={select}
      {...dragHandleTitleProps}
      role="button"
      tabIndex={0}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={styles.image}>
          <LazyLoadImage src={entry.thumbnail} alt="" className={styles.imageText} onClick={select} />
        </div>
        {!entry.hasCelestialCoords && (
          <span className={styles.skySurvey}>
            Sky Survey
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
        <div className={styles.imageTitle} style={{ maxWidth: '150px' }}>
          { entry.name || entry.identifier }
        </div>
        <OpacitySlider opacity={opacity} identifier={entry.identifier} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 'auto' }}>
        <SkyBrowserInfoBox
          className={styles.removeImageButton}
          dec={entry.dec}
          fov={entry.fov}
          hasCelestialCoords={entry.hasCelestialCoords}
          infoPlacement="left"
          ra={entry.ra}
          style={{ display: 'flex', justifyContent: 'center', borderRadius: '4px' }}
          text={entry.credits}
          textUrl={entry.creditsUrl}
          title={(entry.name || entry.identifier)}
        />
        <Button
          onClick={(e) => {
            stopEventPropagation(e);
            removeSelection(url);
          }}
          className={styles.removeImageButton}
          small
          transparent
        >
          <MdDelete className="small" />
        </Button>
      </div>
    </div>
  );
}

SkyBrowserTabEntry.propTypes = {
  dragHandleTitleProps: PropTypes.object.isRequired,
  isActive: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  opacity: PropTypes.number.isRequired,
};

SkyBrowserTabEntry.defaultProps = {
  isActive: false,
};

export default SkyBrowserTabEntry;
