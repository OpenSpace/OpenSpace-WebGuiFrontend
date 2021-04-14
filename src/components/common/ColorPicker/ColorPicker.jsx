import React, { Component } from 'react';
import {ChromePicker} from 'react-color';
import PropTypes from 'prop-types';
import styles from './ColorPicker.scss';

class ColorPicker extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { color, disableAlpha, onChange } = this.props;

    return (
      <ChromePicker
        className={`${styles.OpenSpaceColorPicker}`}
        styles={styles}
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
