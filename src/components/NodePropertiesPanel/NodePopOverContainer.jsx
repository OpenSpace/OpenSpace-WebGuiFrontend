import React, { Component } from 'react';
import { connect } from 'react-redux';
import FocusNodePropertiesPanel from './FocusNodePropertiesPanel';
import NodePropertiesPanel from './NodePropertiesPanel';
import styles from './NodePopOverContainer.scss';

class NodePopOverContainer extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { activeNodePropertyPanels } = this.props;
    return (
      <div className={styles.nodePopOverContainer}>
      <FocusNodePropertiesPanel />
      { activeNodePropertyPanels.map(uri => (
              <NodePropertiesPanel
                uri={uri}
                key={uri}
              />)) }

      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const activeNodePropertyPanels = state.local.popovers.activeNodePropertyPanels;
  const panels = Object.keys(activeNodePropertyPanels).map(function(key) {
      return key;
  });

  return {
    activeNodePropertyPanels: panels,
  };
};

NodePopOverContainer = connect(
  mapStateToProps,
)(NodePopOverContainer);

export default NodePopOverContainer;
