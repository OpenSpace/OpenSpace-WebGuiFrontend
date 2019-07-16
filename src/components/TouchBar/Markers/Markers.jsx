import React, { Component } from 'react';
import { connect } from 'react-redux';
import Marker from './Marker';

class Markers extends Component {
  constructor(props) {
    super(props);
  }

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

  render() {
    return(
      <div className='Markers'>
        {this.createInfoMarkers()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let focusNodes = [];
  const focusButtons = state.storyTree.story.focusbuttons;

  if (focusButtons) {
    focusNodes = focusButtons.map(button => 
      state.propertyTree.propertyOwners['Scene.' + button]
    );
  }

  return {
    focusNodes
  }
};

Markers = connect(
  mapStateToProps
)(Markers);

export default Markers;
