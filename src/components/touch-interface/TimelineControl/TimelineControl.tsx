import React, { useState, useCallback, useRef } from 'react';
import styles from './TimelineControl.scss'; // Make sure your CSS is updated accordingly

interface TimelineControlProps {
  onTimeChange: (newTime: number) => void;
  minTime: number;
  maxTime: number;
  label?: string;
}

const TimelineControl: React.FC<TimelineControlProps> = ({
  onTimeChange,
  minTime,
  maxTime,
  label = ''
}) => {
  const [timelineOffset, setTimelineOffset] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Create time points
  const timePoints = [];
  for (let year = minTime; year <= maxTime; year += 10) {
    timePoints.push(year);
  }

  const startDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      isDragging.current = true;
      const startX = e.clientX;
      const startOffset = timelineOffset;

      const doDrag = (e: MouseEvent) => {
        const currentX = e.clientX;
        setTimelineOffset(startOffset + (currentX - startX));
      };

      const stopDrag = () => {
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
        isDragging.current = false;
      };

      document.addEventListener('mousemove', doDrag);
      document.addEventListener('mouseup', stopDrag);
    },
    [timelineOffset]
  );

  return (
    <div className={styles.timelineWrapper}>
      <div className={styles.timelineContainer} onMouseDown={startDrag} ref={timelineRef}>
        <div className={styles.timeline} style={{ left: timelineOffset }}>
          {timePoints.map((year) => (
            <div key={year} className={styles.timePoint}>
              {year}
            </div>
          ))}
        </div>
      </div>
      {label && <div className={styles.label}>{label}</div>}
    </div>
  );
};

export default TimelineControl;
