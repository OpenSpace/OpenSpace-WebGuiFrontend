import React, { Component } from 'react';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import { connectProperty } from './connectProperty';
import InfoBox from '../../common/InfoBox/InfoBox';
import { copyTextToClipboard } from '../../../utils/helpers';

class BoolProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.copyUri = this.copyUri.bind(this);
  }

  onChange(value) {
    this.props.dispatcher.set(value);
  }

  componentDidMount() {
    this.props.dispatcher.subscribe();
  }

  componentWillUnmount() {
    this.props.dispatcher.unsubscribe();
  }

  get descriptionPopup() {
    const { description } = this.props.description;
    return description ? <span onClick={this.copyUri}>
      <InfoBox onClick={this.copyUri} text={description} />
    </span> : '';
  }

  copyUri(e) {
    copyTextToClipboard(this.props.description.Identifier);
    e.stopPropagation();
  }

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
  }

  render() {
    const { description, value } = this.props;
    const showText = !this.props.checkBoxOnly;

    return (
      <Checkbox
        wide={!this.props.checkBoxOnly}
        checked={value}
        label={showText ? (<span>{description.Name} {this.descriptionPopup}</span>) : null}
        setChecked={this.onChange}
        disabled={this.disabled}
      />
    );
  }
}

export default BoolProperty;
