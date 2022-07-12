import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from '../NodePropertiesPanel/NodePopOverContainer.scss';
import NodeMetaPanel from './NodeMetaPanel';

class NodeMetaContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { activeNodeMetaPanels } = this.props;
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
}

const mapStateToProps = (state) => {
  const { activeNodeMetaPanels } = state.local.popovers;
  const panels = Object.keys(activeNodeMetaPanels).map((key) => key);

  return {
    activeNodeMetaPanels: panels,
  };
};

NodeMetaContainer = connect(
  mapStateToProps,
)(NodeMetaContainer);

export default NodeMetaContainer;
