import React from 'react';
import styles from './StatusBar.scss';
import { useSelector } from 'react-redux';

export default function StatusBar() {
  const TouchModeStatus = () => {
    const touchMode = useSelector((state: any) => state.local.touchMode);

    switch (touchMode) {
      case 'orbit':
        return <div>🌎</div>;
      case 'translate':
        return <div>📷</div>;
      default:
        return <div>🌍</div>;
    }
  };

  return (
    <div className={styles.container}>
      {TouchModeStatus()}
      <div>1000m</div>
    </div>
  );
}
