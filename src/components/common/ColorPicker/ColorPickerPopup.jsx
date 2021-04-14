import React, { Component } from 'react';
import styles from './ColorPickerPopup.scss';
import PropTypes from 'prop-types';
import Button from '../Input/Button/Button';
import Tooltip from '../Tooltip/Tooltip';
import ColorPicker from './ColorPicker';

class ColorPickerPopup extends Component {
  constructor(props) {
    super(props);

    this.state = { showPopup: false };

    this.setRef = this.setRef.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.closePopup = this.closePopup.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.closePopup, true);

    // TODO: set from property
    window.addEventListener('mousedown', this.handleOutsideClick, true);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.closePopup);

    // TODO: set from property
    window.removeEventListener('mousedown', this.handleOutsideClick);
  }

  setRef(what) {
    return (element) => {
      this[what] = element;
    };
  }

  get position() {
    if (!this.wrapper) return { top: '0px', left: '0px' };
    const { top, right } = this.wrapper.getBoundingClientRect();
    return { top: `${top}px`, left: `${right}px` };
  }

  togglePopup(evt) {
    this.setState({ showPopup: !this.state.showPopup });
  }

  handleOutsideClick(evt) {
    if (this.wrapper && !this.wrapper.contains(evt.target)) {
      this.closePopup();
    }
  }

  closePopup() {
    this.setState({ showPopup: false });
  }

  render() {
    const { color, disableAlpha, onChange, placement, fixed} = this.props;

    const colorSwatchBg = {
      background: `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`
    };

    return (
      <span
        ref={this.setRef('wrapper')}
      >
        <Button block small onClick={this.togglePopup} nopadding>
          <div className={styles.colorSwatch} style={colorSwatchBg}></div>
        </Button>
        { this.state.showPopup && (
            <div 
              className={`${styles.popup} ${styles.right}`}
              style={this.position}
            >
              <ColorPicker 
                disableAlpha={disableAlpha}
                color={color}
                onChange={onChange}
              />
            </div>
        )}
      </span>
    );
  }
}

ColorPickerPopup.propTypes = {
  color: PropTypes.object.isRequired,
  disableAlpha: PropTypes.bool,
  onChange: PropTypes.func,
};

ColorPickerPopup.defaultProps = {
  disableAlpha: false,
};

export default ColorPickerPopup;
