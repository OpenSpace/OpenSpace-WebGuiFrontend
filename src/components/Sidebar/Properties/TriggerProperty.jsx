import React, { Component } from 'react';
import { copyTextToClipboard } from '../../../utils/helpers';
import InfoBox from '../../common/InfoBox/InfoBox';
import Button from '../../common/Input/Button/Button';

class TriggerProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.copyUri = this.copyUri.bind(this);
  }

  onChange() {
    this.props.dispatcher.set(null);
  }

  get descriptionPopup() {
    const { description } = this.props.description;
    return description ? <span onClick={this.copyUri}><InfoBox text={description} /></span> : '';
  }

  copyUri() {
    copyTextToClipboard(this.props.description.Identifier);
  }

  render() {
    const { Name } = this.props.description;
    return (
      <div style={{ marginBottom: 3 }}>
        <Button onClick={this.onChange}>
          { Name }
        </Button>
        {' '}
        { this.descriptionPopup }
      </div>
    );
  }
}

export default TriggerProperty;
