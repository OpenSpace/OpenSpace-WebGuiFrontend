import React, { useState } from 'react';
import styles from './Timeline.scss';

interface TimelineProps {
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  [key: string]: any; // For any additional props
}

// Mock implementation for generating unique IDs if needed
const nextId = (() => {
  let id = 0;
  return () => id++;
})();

const Timeline: React.FC<TimelineProps> = ({
  defaultValue = new Date().getFullYear(),
  min = new Date().getFullYear() - 10, // Adjust the range as needed
  max = new Date().getFullYear() + 10, // Adjust the range as needed
  onChange = () => {},
  ...rest
}) => {
  const [value, setValue] = useState<number>(defaultValue);

  const id = `timeline-${nextId()}`;

  const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.currentTarget.value, 10);
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={styles.timelineContainer}>
      <input
        {...rest}
        id={id}
        value={value}
        onChange={onValueChange}
        min={min}
        max={max}
        step={1}
        type='range'
        className={styles.timelineInput}
      />
      <div className={styles.labels}>
        <span className={styles.yearLabel}>{min}</span>
        <span className={styles.yearLabel}>{max}</span>
      </div>
      <div className={styles.currentYear}>{value}</div>
    </div>
  );
};

export default Timeline;
