import React from 'react';
import { useSelector } from 'react-redux';

import IndividualUserControlPanel from './IndividualUserControlPanel';

import styles from './UserControlPanel.scss';

function UserControlPanelContainer() {
  const activeUserPanels = useSelector((state) => {
    const activePanels = state.local.popovers.activeUserControlPanels;
    // TODO MICAH get help repeating call
    // console.log(activePanels)
    return Object.keys(activePanels).map((key) => key);
  });

  return (
    <div className={styles.container}>
      {
        activeUserPanels.map((uri) => <IndividualUserControlPanel uri={uri} key={uri} />)
      }
    </div>
  );
}

export default UserControlPanelContainer;
