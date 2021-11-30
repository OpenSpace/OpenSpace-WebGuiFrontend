import React, { Component } from 'react';
import NumericInput from '../../common/Input/NumericInput/NumericInput';
import InfoBox from '../../common/InfoBox/InfoBox';
import { connectProperty } from './connectProperty';
import { copyTextToClipboard } from '../../../utils/helpers';
import styles from './Property.scss';

class NumericProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.copyUri = this.copyUri.bind(this);
  }

  componentDidMount() {
    this.props.dispatcher.subscribe();
  }

  componentWillUnmount() {
    this.props.dispatcher.unsubscribe();
  }

  get descriptionPopup() {
    const { description } = this.props.description;
    return description ? <InfoBox text={description} /> : '';
  }

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
  }

  onChange(newValue) {
    this.props.dispatcher.set(newValue);
  }

  get descriptionPopup() {
    let { description } = this.props;
    const { MaximumValue, MinimumValue } = description.AdditionalData;
    const descriptionString = `${description.description}\nMin: ${MinimumValue}, max: ${MaximumValue}`;
    return descriptionString ? (<InfoBox text={descriptionString} />) : '';
  }

  copyUri() {
    copyTextToClipboard(this.props.description.Identifier);
  }

  render() {
    const { description, value } = this.props;
    const { SteppingValue, MaximumValue, MinimumValue, Exponent } = description.AdditionalData;
    return (
      <div className={`${this.disabled ? styles.disabled : ''}`}>
        <NumericInput
          value={value}
          label={(<span onClick={this.copyUri}>{description.Name} {this.descriptionPopup}</span>)}
          placeholder={description.Name}
          onValueChanged={this.onChange}
          step={SteppingValue}
          exponent={Exponent}
          max={MaximumValue}
          min={MinimumValue}
          disabled={this.disabled}
        />
      </div>
    );
  }
}

export default NumericProperty;
