import React, { Component } from 'react';
import { connect } from 'react-redux';
import NodeMetaPanel from './NodeMetaPanel';
import styles from '../NodePropertiesPanel/NodePopOverContainer.scss';

class NodeMetaContainer extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { activeNodeMetaPanels } = this.props;
    return (
      <div className={styles.NodePopOverContainer}>
      { activeNodeMetaPanels.map(uri => (
              <NodeMetaPanel
                uri={uri}
                key={uri}
              />)) }

      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const activeNodeMetaPanels = state.local.popovers.activeNodeMetaPanels;
  const panels = Object.keys(activeNodeMetaPanels).map(function(key) {
      return key;
  });

  return {
    activeNodeMetaPanels: panels,
  };
};

NodeMetaContainer = connect(
  mapStateToProps,
)(NodeMetaContainer);

export default NodeMetaContainer;
