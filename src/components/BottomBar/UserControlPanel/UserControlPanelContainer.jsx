import React from 'react';
import { useSelector } from 'react-redux';

import styles from './UserControlPanel.scss';
import IndividualUserControlPanel from './IndividualUserControlPanel';

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
