import React, { useState } from 'react';
import Input from '../../common/Input/Input';

import styles from './ScaleInput.scss';

interface ScaleInputProps {
  centerMarker?: boolean;
  defaultValue?: number;
  label?: string;
  leftLabel?: string;
  leftTicks?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  rightLabel?: string;
  rightTicks?: number;
  step?: number;
  wide?: boolean;
  [key: string]: any;
}

// Mock implementation for Input.nextId if it doesn't exist
const nextId = (() => {
  let id = 0;
  return () => id++;
})();

const ScaleInput: React.FC<ScaleInputProps> = ({
  centerMarker = true,
  defaultValue = 0,
  leftLabel = '-',
  rightLabel = '+',
  leftTicks = 5,
  rightTicks = 5,
  label = '',
  onChange = () => {},
  min = -1,
  max = 1,
  wide = true,
  ...rest
}) => {
  const [value, setValue] = useState<number>(defaultValue);

  const id = `scale-${nextId()}`;

  const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.currentTarget.value);
    setValue(newValue);
    onChange(newValue);
  };

  const markers = () => {
    const showMarkers = centerMarker || (leftTicks > 0 && rightTicks > 0);
    const width = (100 * (defaultValue - min)) / (max - min);

    return (
      showMarkers && (
        <div className={styles.markers}>
          <div className={styles.ticks} style={{ width: `calc(${width}% - 2px)` }}>
            {Array.from({ length: leftTicks }, (_, i) => (
              <div key={i} className={styles.tick} />
            ))}
          </div>
          {centerMarker && <div className={styles.centerMarker} />}
          <div className={styles.ticks} style={{ width: `calc(${100 - width}% - 2px)` }}>
            {Array.from({ length: rightTicks }, (_, i) => (
              <div key={i} className={styles.tick} />
            ))}
          </div>
        </div>
      )
    );
  };

  const reset = () => {
    setValue(defaultValue);
    onChange(defaultValue);
  };

  return (
    <div className={`${styles.group} ${wide ? styles.wide : ''}`}>
      {markers()}
      <input
        {...rest}
        id={id}
        value={value}
        onChange={onValueChange}
        onMouseUp={reset}
        onBlur={reset}
        min={min}
        max={max}
        type='range'
        className={`${styles.input} ${wide ? styles.wide : ''}`}
      />
      <div className={styles.labels}>
        <span className={styles.leftLabel}>{leftLabel}</span>
        <label htmlFor={id}>{label}</label>
        <span className={styles.rightLabel}>{rightLabel}</span>
      </div>
    </div>
  );
};

export default ScaleInput;
