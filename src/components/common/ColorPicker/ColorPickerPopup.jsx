import React from 'react';
import PropTypes from 'prop-types';

import TooltipMenu from '../Tooltip/TooltipMenu';

import ColorPicker from './ColorPicker';

import styles from './ColorPickerPopup.scss';

const { Checkboard } = require('react-color/lib/components/common');

function ColorPickerPopup({
  className = '', color, disableAlpha = false, disabled = false, onChange
}) {
  const colorSwatchBg = {
    background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
  };

  const colorSwatchButton = (
    <div className={styles.colorSwatch}>
      <div className={styles.colorOverlay} style={colorSwatchBg} />
      <div className={styles.checkboard}>
        <Checkboard size={10} white="#fff" grey="#ccc" />
      </div>
    </div>
  );

  return (
    <TooltipMenu
      className={`${className} ${styles.fullHeight}`}
      disabled={disabled}
      sourceObject={colorSwatchButton}
    >
      <ColorPicker
        disableAlpha={disableAlpha}
        color={color}
        onChange={onChange}
      />
    </TooltipMenu>
  );
}

ColorPickerPopup.propTypes = {
  className: PropTypes.string,
  color: PropTypes.object.isRequired,
  disableAlpha: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};

export default ColorPickerPopup;
