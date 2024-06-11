import React from 'react';
import styles from './StatusBar.scss';
import { useSelector } from 'react-redux';
import { LuOrbit } from 'react-icons/lu';
import { IoCameraReverse, IoPlanet } from 'react-icons/io5';

export default function StatusBar() {
  const TouchModeStatus = () => {
    const touchMode = useSelector((state: any) => state.local.touchMode);

    switch (touchMode) {
      case 'orbit':
        return (
          <div className={styles.modeIcon}>
            <IoPlanet />
          </div>
        );
      case 'translate':
        return (
          <div className={styles.modeIcon}>
            <IoCameraReverse />
          </div>
        );
      default:
        return (
          <div className={styles.modeIcon}>
            {' '}
            <IoPlanet />
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>{TouchModeStatus()}</div>
    </div>
  );
}
