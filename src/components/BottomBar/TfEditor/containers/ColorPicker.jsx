import React from 'react';
import { ChromePicker } from 'react-color';
import PropTypes from 'prop-types';

function ColorPicker({ onColorChange }) {
  const [color, setColor] = React.useState('#fff');

  function handleChangeComplete(color) {
    setColor(color.hex);
    onColorChange(color.hex);
  }

  return (
    <ChromePicker
      disableAlpha
      {...this.props}
      color={this.state.color}
      onChangeComplete={(color) => handleChangeComplete(color)}
    />
  );
}

ColorPicker.propTypes = {
  onColorChange: PropTypes.func.isRequired
};

export default ColorPicker;
