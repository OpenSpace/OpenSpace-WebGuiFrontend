import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ChromePicker } from 'react-color';
import styles from './ColorPicker.scss';

class ColorPicker extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { color, disableAlpha, onChange } = this.props;

    // Override some default styling 
    const customPickerStyles = {
      'default': {
        picker: {
          boxShadow: 'none',
          width: '153px',
        },
        // White backgrounds, to show checkboard
        alpha: {
          background: 'white'
        },
        swatch: {
          background: 'white'
        },
        body: {
          padding: '12px 8px 10px'
        }
      },
      'disableAlpha': {
        swatch: {
          // The white bg results in ugly border for opaque colors,
          // so remove it when alpha is disabled
          background: 'transparent'
        }
      }
    };

    return (
      <ChromePicker
        className={`${styles.OpenSpaceColorPicker}`}
        styles={styles, customPickerStyles}
        disableAlpha={disableAlpha}
        color={color}
        onChange={onChange}
      />
    );
  }
}

ColorPicker.propTypes = {
  color: PropTypes.object.isRequired,
  disableAlpha: PropTypes.bool,
  onChange: PropTypes.func,
};

ColorPicker.defaultProps = {
  disableAlpha: false,
};

export default ColorPicker;
