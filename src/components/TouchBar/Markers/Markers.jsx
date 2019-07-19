import React, { Component } from 'react';
import { connect } from 'react-redux';
import Marker from './Marker';
import { ScenePrefixKey, NavigationAnchorKey } from '../../../api/keys';

class Markers extends Component {
  constructor(props) {
    super(props);
  }

  /* TODO: When we handle occlusion properly we want
   to show markers for all focus nodes at the same time
  createInfoMarkers(){
    return (
      this.props.focusNodes.map((node, i) => {
        return(
          <Marker
              key = {this.props.focusNodes[i].identifier}
              nodeIdentifier = {this.props.focusNodes[i].identifier}
          />
        );
      })
    );
  }
  */
  render() {
    return(
      <div className='Markers'>
          <Marker
              key = {this.props.anchorNode.identifier}
              nodeIdentifier = {this.props.anchorNode.identifier}
          />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const anchorNodeId = state.propertyTree.properties[NavigationAnchorKey].value;
  const anchorNode = state.propertyTree.propertyOwners[ScenePrefixKey + anchorNodeId];

  return {
    anchorNode
  }
};

Markers = connect(
  mapStateToProps
)(Markers);

export default Markers;
