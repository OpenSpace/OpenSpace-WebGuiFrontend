import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Input/Button/Button';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import SkyBrowserInfoBox from './SkyBrowserInfoBox';
import styles from './SkyBrowserFocusEntry.scss';
import { LazyLoadImage } from "react-lazy-load-image-component";

class OpacitySlider extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    // Ensure the image has an id, which consists of the index of the image
    const index = Number(this.props.identifier);
    const opacity = event.target.value / 100;
    if (index) {
      this.props.setOpacity(index, opacity);
    }
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
  }

  render() {
    const { opacity } = this.props;
    return (
      <div className={styles.slidecontainer}>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity * 100}
          className={styles.slider}
          onChange={this.handleChange}
        />
        {' '}
      </div>
    );
  }
}

class SkyBrowserFocusEntry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showButtonInfo: false,
    };
    this.select = this.select.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
  }

  get isActive() {
    const { active, identifier } = this.props;
    return identifier === active;
  }

  get isTabEntry() {
    return !!this.props.setOpacity;
  }

  select(e) {
    const { identifier, onSelect } = this.props;
    if (onSelect && identifier) {
      onSelect(identifier);
    }
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
  }

  showTooltip() {
    this.setState({ showButtonInfo: !this.state.showButtonInfo });
  }

  hideTooltip() {
    this.setState({ showButtonInfo: false });
  }

  render() {
    const {
      name, identifier, thumbnail, credits, creditsUrl, ra, dec, fov, hasCelestialCoords,
      luaApi, setOpacity, removeImageSelection, currentBrowserColor, opacity } = this.props;
    const skySurveyTag = !hasCelestialCoords ? <span className={styles.skySurvey}>
        Sky Survey
    </span> : "";

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
    return (
      <li
        className={`${styles.entry} ${this.isTabEntry && styles.tabEntry} ${this.isActive && styles.active}`}
        style={{ borderLeftColor: currentBrowserColor() }}
        onMouseOver={() => { luaApi.skybrowser.moveCircleToHoverImage(Number(identifier)); }}
        onMouseOut={() => { luaApi.skybrowser.disableHoverCircle(); }}
        onClick={setOpacity ? undefined : this.select}
      >
        {imageRemoveButton}
        <div className={styles.image}>
          <LazyLoadImage src={thumbnail} alt={''} className={styles.imageText} onClick={setOpacity ? this.select : undefined}/>
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
            isTabEntry={this.isTabEntry}
            hasCelestialCoords={hasCelestialCoords}
          />
        </div>
        {opacitySlider}
        {!setOpacity && skySurveyTag}
      </li>
    );
  }
}

SkyBrowserFocusEntry.propTypes = {
  identifier: PropTypes.string.isRequired,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  active: PropTypes.string,
};

SkyBrowserFocusEntry.defaultProps = {
  active: '',
  onSelect: null,
};

export default SkyBrowserFocusEntry;
