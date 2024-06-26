import React from 'react';
import { useSelector } from 'react-redux';

import NodePropertiesPanel from './NodePropertiesPanel';

import styles from './NodePopOverContainer.scss';

function NodePopOverContainer() {
  const activeNodePropertyPanels = useSelector((state) => {
    const activePanels = state.local.popovers.activeNodePropertyPanels;
    return Object.keys(activePanels).map((key) => key);
  });

  return (
    <div className={styles.nodePopOverContainer}>
      {
        activeNodePropertyPanels.map((uri) => <NodePropertiesPanel uri={uri} key={uri} />)
      }
    </div>
  );
}

export default NodePopOverContainer;
