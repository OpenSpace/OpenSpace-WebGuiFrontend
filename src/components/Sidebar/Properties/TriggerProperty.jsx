import React, { Component } from 'react';

import Button from '../../common/Input/Button/Button';

import PropertyLabel from './PropertyLabel';

class TriggerProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    this.props.dispatcher.set(null);
  }

  render() {
    const { description } = this.props;
    // Remove the name of the property popup because the info
    // popup should appear outside of the Button
    const noNameDescription = { ...description };
    noNameDescription.Name = '';
    return (
      <div style={{ marginBottom: 3 }}>
        <Button onClick={this.onChange}>
          { description.Name }
        </Button>
        <PropertyLabel description={noNameDescription} />
      </div>
    );
  }
}

export default TriggerProperty;
