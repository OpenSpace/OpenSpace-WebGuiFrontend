import React, { Component } from 'react';
import { connect } from 'react-redux';
import NodePropertiesPanel from './NodePropertiesPanel';
import { NavigationAnchorKey, ScenePrefixKey } from '../../api/keys';

class FocusNodePropertiesPanel extends Component {

	constructor(props) {
    super(props);
	}

  render() {
    const { node } = this.props;
    return (
      <NodePropertiesPanel uri={node} isFocusNodePanel={true}/>
    );
  }
}

const mapStateToProps = (state) => {
  const anchorProp = state.propertyTree.properties[NavigationAnchorKey];
  const anchorNodeURI = anchorProp ? ScenePrefixKey + anchorProp.value : "";

  return {
    node: anchorNodeURI,
  };
};

FocusNodePropertiesPanel = connect(
  mapStateToProps,
)(FocusNodePropertiesPanel);

export default FocusNodePropertiesPanel;
