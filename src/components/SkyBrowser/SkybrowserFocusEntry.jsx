import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Input/Button/Button';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import InfoBoxSkybrowser from './InfoBoxSkybrowser';
import styles from './SkybrowserFocusEntry.scss';

class OpacitySlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 100,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    // Ensure the image has an id, which consists of the index of the image
    const index = Number(this.props.identifier);
    const opacity = event.target.value / 100;
    if (index) {
      this.props.setOpacity(index, opacity);
    }
  }

  render() {
    const { value } = this.state;
    return (
      <div className={styles.slidecontainer}>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          className={styles.slider}
          onChange={this.handleChange}
        />
        {' '}
      </div>
    );
  }
}

class SkybrowserFocusEntry extends Component {
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

  select(evt) {
    const { identifier, onSelect } = this.props;
    if (onSelect && identifier) {
      onSelect(identifier);
    }
  }

  showTooltip() {
    this.setState({ showButtonInfo: !this.state.showButtonInfo });
  }

  hideTooltip() {
    this.setState({ showButtonInfo: false });
  }

  render() {
    const {
      name, identifier, thumbnail, credits, creditsUrl, ra, dec, fov,
    } = this.props;
    const { skybrowserApi, setOpacity, removeImageSelection } = this.props;

    const imageRemoveButton = removeImageSelection && (
      <div style={{ display: 'flex' }}>
        <Button
          onClick={() => removeImageSelection(identifier)}
          className={styles.removeImageButton}
          transparent
          small
        >
          <MaterialIcon icon="close" className="small" />
        </Button>
      </div>
    );

    const opacitySlider = setOpacity ? <OpacitySlider setOpacity={setOpacity} identifier={identifier} /> : '';

    return (
      <li
        className={`${styles.entry} ${this.isTabEntry && styles.tabEntry} ${this.isActive && styles.active}`}
        style={{ borderLeftColor: this.props.currentTargetColor() }}
        onMouseEnter={() => { skybrowserApi.moveCircleToHoverImage(Number(identifier)); }}
        onMouseLeave={() => { skybrowserApi.disableHoverCircle(); }}
        onClick={setOpacity ? undefined : this.select}
      >
        {imageRemoveButton}
        <div className={styles.image}>
          <img src={thumbnail} alt={''} loading='lazy' className={styles.imageText} onClick={setOpacity ? this.select : undefined}/>
        </div>
        <div className={styles.imageHeader}>
          <span className={styles.imageTitle}>
            { name || identifier }
          </span>
          <InfoBoxSkybrowser
            title={(name || identifier)}
            text={credits}
            textUrl={creditsUrl}
            ra={ra}
            dec={dec}
            fov={fov}
            isTabEntry={this.isTabEntry}
          />
        </div>
        {opacitySlider}
      </li>
    );
  }
}

SkybrowserFocusEntry.propTypes = {
  identifier: PropTypes.string.isRequired,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  active: PropTypes.string,
};

SkybrowserFocusEntry.defaultProps = {
  active: '',
  onSelect: null,
};

export default SkybrowserFocusEntry;
