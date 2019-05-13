import React from 'react';
import PropertyBase from './PropertyBase';
import Button from '../../common/Input/Button/Button';
import { connectProperty } from './connectProperty';

class TriggerProperty extends PropertyBase {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    this.props.dispatcher.set(null);
  }

  render() {
    const { Name } = this.props.Description;
    return (
      <div>
        <Button onClick={this.onChange}>
          { Name }
        </Button> { this.descriptionPopup }
      </div>
    );
  }
}

TriggerProperty = connectProperty(TriggerProperty);

export default TriggerProperty;
