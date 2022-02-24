import React, { Component } from 'react';
import { connect } from 'react-redux';
import ToggleBoolButton from './ToggleBoolButton';

class ToggleBoolButtons extends Component {
  constructor(props) {
    super(props);
    this.handleGroup = this.handleGroup.bind(this);
    this.toggleButtons = [];
  }

  handleGroup(clickedProperty) {
    const { properties } = this.props;
    properties.foreach((p, i) => {
      if (clickedProperty.property.URI !== p.URI && clickedProperty.property.group === p.group) {
        this.toggleButtons[p.URI].disableIfChecked();
      }
    });
  }

  get propertiesButtons() {
    const { properties } = this.props;
    return (
      properties.map((property, i) => (
        <ToggleBoolButton
          ref={ref => this.toggleButtons[property.URI] = ref}
          key={property.URI}
          property={property}
          handleGroup={this.handleGroup}
        />
      ))
    );
  }

  render() {
    return (
      <div style={{ display: 'flex' }}>
        {this.propertiesButtons}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const properties = state.storyTree.story.toggleboolproperties;
  return {
    properties,
  };
};

ToggleBoolButtons = connect(
  mapStateToProps,
)(ToggleBoolButtons);

export default ToggleBoolButtons;
