import React from 'react';
import { connect } from 'react-redux';

import FocusNodePropertiesPanel from './FocusNodePropertiesPanel';
import NodePropertiesPanel from './NodePropertiesPanel';

import styles from './NodePopOverContainer.scss';

function NodePopOverContainer({ activeNodePropertyPanels }) {
  return (
    <div className={styles.nodePopOverContainer}>
      <FocusNodePropertiesPanel />
      {
        activeNodePropertyPanels.map((uri) => <NodePropertiesPanel uri={uri} key={uri} />)
      }
    </div>
  );
}

const mapStateToProps = (state) => {
  const { activeNodePropertyPanels } = state.local.popovers;
  const panels = Object.keys(activeNodePropertyPanels).map((key) => key);

  return {
    activeNodePropertyPanels: panels
  };
};

NodePopOverContainer = connect(
  mapStateToProps,
)(NodePopOverContainer);

export default NodePopOverContainer;
