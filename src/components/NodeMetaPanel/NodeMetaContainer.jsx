import React from 'react';
import { useSelector } from 'react-redux';

import NodeMetaPanel from './NodeMetaPanel';

import styles from '../NodePropertiesPanel/NodePopOverContainer.scss';

function NodeMetaContainer() {
  const activeNodeMetaPanels = useSelector((state) => {
    const panels = state.local.popovers.activeNodeMetaPanels;
    return [...Object.keys(panels)];
  });

  return (
    <div className={styles.NodePopOverContainer}>
      { activeNodeMetaPanels.map((uri) => (
        <NodeMetaPanel
          uri={uri}
          key={uri}
        />
      )) }

    </div>
  );
}

export default NodeMetaContainer;
