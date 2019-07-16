import React, { Component } from 'react';
import { connect } from 'react-redux';
import ToggleBoolButton from './ToggleBoolButton';

class ToggleBoolButtons extends Component {
  constructor(props) {
    super(props);
	}

  get propertiesButtons(){
    return (
      this.props.properties.map((property, i) => {
        return(
			    <ToggleBoolButton
			        key={property.URI}
			        property={property}
			    />
        );
      })
    );
  }

 render() {
  return (
    <div style={{ display: 'flex' }}>
      {this.propertiesButtons}
    </div>
  );
 };
}

const mapStateToProps = (state) => {

	const properties = state.storyTree.story.toggleboolproperties;

  return {
    properties
  };
}

ToggleBoolButtons = connect(
  mapStateToProps
)(ToggleBoolButtons);

export default ToggleBoolButtons;
