import React from 'react';
import { useSelector } from 'react-redux';

import NodePropertiesPanel from './NodePropertiesPanel';

import styles from './NodePopOverContainer.scss';

function NodePopOverContainer() {
  const activePanels = useSelector((state) => state.local.popovers.activeNodePropertyPanels);
  const activeNodePropertyPanels = Object.keys(activePanels).map((key) => key);

  return (
    <div className={styles.nodePopOverContainer}>
      {
        activeNodePropertyPanels.map((uri) => <NodePropertiesPanel uri={uri} key={uri} />)
      }
    </div>
  );
}

export default NodePopOverContainer;
