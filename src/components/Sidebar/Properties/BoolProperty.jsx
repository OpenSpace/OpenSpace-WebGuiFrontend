import React, { Component } from 'react';

import { copyTextToClipboard } from '../../../utils/helpers';
import InfoBox from '../../common/InfoBox/InfoBox';
import Checkbox from '../../common/Input/Checkbox/Checkbox';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

class BoolProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.copyUri = this.copyUri.bind(this);
  }

  onChange(value) {
    this.props.dispatcher.set(value);
  }

  get descriptionPopup() {
    const { description } = this.props.description;
    return description ? (
      <span onClick={this.copyUri}>
        <InfoBox onClick={this.copyUri} text={description} />
      </span>
    ) : '';
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
      <div className={`${this.disabled ? styles.disabled : ''}`}>
        <Checkbox
          wide={!this.props.checkBoxOnly}
          checked={value}
          setChecked={this.onChange}
          disabled={this.disabled}
        >
          {showText && <PropertyLabel description={description} />}
        </Checkbox>
      </div>
    );
  }
}

export default BoolProperty;
