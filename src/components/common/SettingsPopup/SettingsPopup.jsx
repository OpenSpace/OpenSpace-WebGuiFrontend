import React from 'react';

import MaterialIcon from '../MaterialIcon/MaterialIcon';
import Tooltip from '../Tooltip/Tooltip';

import buttonStyles from '../Input/Button/Button.scss';
import styles from './SettingsPopup.scss';

export default function SettingsPopup({ children }) {
  const [showSearchSettings, setShowSearchSettings] = React.useState(false);

  return (
    <div
      onClick={() => setShowSearchSettings((current) => !current)}
      onKeyDown={() => setShowSearchSettings((current) => !current)}
      className={`${styles.settings} ${buttonStyles.button} 
        ${showSearchSettings && styles.settingsFocus}`}
      role="button"
      tabIndex={0}
    >
      <MaterialIcon icon="settings" className="small" />
      {showSearchSettings && (
        <Tooltip placement="right" className={styles.toolTip}>
          { children }
        </Tooltip>
      )}
    </div>
  );
}
