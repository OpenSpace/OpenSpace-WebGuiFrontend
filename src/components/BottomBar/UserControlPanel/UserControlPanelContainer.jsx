import React from 'react';
import { useSelector } from 'react-redux';

import IndividualUserControlPanel from './IndividualUserControlPanel';

import styles from './UserControlPanel.scss';

function UserControlPanelContainer() {
  const panels = useSelector((state) => state.local.popovers.activeUserControlPanels);
  return (
    <div className={styles.container}>
      {
        Object.keys(panels).map((uri) => <IndividualUserControlPanel uri={uri} key={uri} />)
      }
    </div>
  );
}

export default UserControlPanelContainer;
