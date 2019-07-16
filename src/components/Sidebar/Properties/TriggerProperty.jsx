import React, { Component } from 'react';
import Button from '../../common/Input/Button/Button';
import InfoBox from '../../common/InfoBox/InfoBox';
import { connectProperty } from './connectProperty';

class TriggerProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    this.props.dispatcher.set(null);
  }

  get descriptionPopup() {
    const { description } = this.props.description;
    return description ? <InfoBox text={description} /> : '';
  }

  render() {
    const { Name } = this.props.description;
    return (
      <div style={{marginBottom: 3}}>
        <Button onClick={this.onChange}>
          { Name }
        </Button> { this.descriptionPopup }
      </div>
    );
  }
}

export default TriggerProperty;
