import React, { Component } from 'react';
import { connect } from 'react-redux';
import ToggleBoolButton from './ToggleBoolButton';

class ToggleBoolButtons extends Component {
  constructor(props) {
    super(props);
	this.handleGroup = this.handleGroup.bind(this);
	this.toggleButtons =[];
  }
  
  handleGroup (clickedProperty) {
	  this.props.properties.map((property, i) => {
        if(clickedProperty.property.URI != property.URI && clickedProperty.property.group == property.group){
			this.toggleButtons[property.URI].disableIfChecked();
		}
      })
  }

  get propertiesButtons(){
    return (
      this.props.properties.map((property, i) => {
        return(
          <ToggleBoolButton
			  ref={ref => this.toggleButtons[property.URI] = ref}
              key={property.URI}
              property={property}
			  handleGroup = {this.handleGroup} 
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

const mapStateToProps = (state, ownProps) => {
  const properties = state.storyTree.story.toggleboolproperties;
  return {
    properties
  };
}

ToggleBoolButtons = connect(
  mapStateToProps
)(ToggleBoolButtons);

export default ToggleBoolButtons;
