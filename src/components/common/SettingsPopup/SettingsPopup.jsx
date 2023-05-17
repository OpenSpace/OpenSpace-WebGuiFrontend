import React from 'react';

import Button from '../Input/Button/Button';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import Tooltip from '../Tooltip/Tooltip';

import styles from './SettingsPopup.scss';

export default function SettingsPopup({ children }) {
  const [showSearchSettings, setShowSearchSettings] = React.useState(false);

  return (
    <Button
      onClick={() => setShowSearchSettings((current) => !current)}
      className={`${styles.settings} ${showSearchSettings && styles.settingsFocus}`}
    >
      <MaterialIcon icon="settings" className="small" />
      {showSearchSettings && (
        <Tooltip placement="right" className={styles.toolTip}>
          { children }
        </Tooltip>
      )}
    </Button>
  );
}
