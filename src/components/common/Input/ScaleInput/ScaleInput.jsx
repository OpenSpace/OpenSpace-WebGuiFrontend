import React from 'react';
import PropTypes from 'prop-types';

import Input from '../Input/Input';

import styles from './ScaleInput.scss';

function ScaleInput({
  centerMarker = true,
  defaultValue = 0,
  label = '',
  leftLabel = '-',
  leftTicks = 5,
  max = 1,
  min = -1,
  onChange = () => {},
  rightLabel = '+',
  rightTicks = 5,
  wide = true,
  ...rest
}) {
  const [value, setValue] = React.useState(defaultValue);

  const id = `scale-${Input.nextId}`;

  function onValueChange(event) {
    const newValue = event.currentTarget.value;
    setValue(newValue);
    onChange(newValue);
  }

  function markers() {
    const showMarkers = centerMarker || (leftTicks > 0 && rightTicks > 0);

    // eslint-disable-next-line no-mixed-operators
    const width = 100 * (defaultValue - min) / (max - min);
    return showMarkers && (
      <div className={styles.markers}>
        <div className={styles.ticks} style={{ width: `calc(${width}% - 2px)` }}>
          { Array.from(new Array(leftTicks), (_, i) => (<div key={i} className={styles.tick} />))}
        </div>
        { centerMarker && (<div className={styles.centerMarker} />) }
        <div className={styles.ticks} style={{ width: `calc(${100 - width}% - 2px)` }}>
          { Array.from(new Array(rightTicks), (_, i) => (<div key={i} className={styles.tick} />))}
        </div>
      </div>
    );
  }

  function reset() {
    setValue(defaultValue);
    onChange(defaultValue);
  }

  return (
    <div className={`${styles.group} ${wide ? styles.wide : ''}`}>
      { markers() }
      <input
        {...rest}
        id={id}
        value={value}
        onChange={onValueChange}
        onMouseUp={reset}
        onBlur={reset}
        min={min}
        max={max}
        type="range"
        className={`${styles.input} ${wide ? styles.wide : ''}`}
      />
      <div className={styles.labels}>
        <span className={styles.leftLabel}>{ leftLabel }</span>
        <label htmlFor={id}>{ label }</label>
        <span className={styles.rightLabel}>{ rightLabel }</span>
      </div>
    </div>
  );
}

ScaleInput.propTypes = {
  centerMarker: PropTypes.bool,
  defaultValue: PropTypes.number,
  label: PropTypes.string,
  leftLabel: PropTypes.string,
  leftTicks: PropTypes.number,
  max: PropTypes.number,
  min: PropTypes.number,
  onChange: PropTypes.func,
  rightLabel: PropTypes.string,
  rightTicks: PropTypes.number,
  wide: PropTypes.bool
};

export default ScaleInput;
