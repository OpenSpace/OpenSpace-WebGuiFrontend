import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from '@iconify/react';
import Tooltip from '../Tooltip/Tooltip';

import buttonStyles from '../Input/Button/Button.scss';
import styles from './SettingsPopup.scss';

function SettingsPopup({ children }) {
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
      <Icon icon="material-symbols:settings" className="small" />
      {showSearchSettings && (
        <Tooltip placement="right" className={styles.toolTip}>
          { children }
        </Tooltip>
      )}
    </div>
  );
}

SettingsPopup.propTypes = {
  children: PropTypes.node
};

SettingsPopup.defaultProps = {
  children: []
};

export default SettingsPopup;
