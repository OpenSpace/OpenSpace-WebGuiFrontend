import React, { Component } from 'react';
import { connect } from 'react-redux';

import { NavigationAnchorKey, ScenePrefixKey } from '../../api/keys';

import NodePropertiesPanel from './NodePropertiesPanel';

class FocusNodePropertiesPanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { node } = this.props;
    return (
      <NodePropertiesPanel uri={node} isFocusNodePanel />
    );
  }
}

const mapStateToProps = (state) => {
  const anchorProp = state.propertyTree.properties[NavigationAnchorKey];
  const anchorNodeURI = anchorProp ? ScenePrefixKey + anchorProp.value : '';

  return {
    node: anchorNodeURI
  };
};

FocusNodePropertiesPanel = connect(
  mapStateToProps,
)(FocusNodePropertiesPanel);

export default FocusNodePropertiesPanel;
