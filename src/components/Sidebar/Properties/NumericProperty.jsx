import React from 'react';
import PropertyBase from './PropertyBase';
import NumericInput from '../../common/Input/NumericInput/NumericInput';
import InfoBox from '../../common/InfoBox/InfoBox';
import { connectProperty } from './connectProperty';

class NumericProperty extends PropertyBase {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.props.dispatcher.subscribe();
  }

  componentWillUnmount() {
    this.props.dispatcher.unsubscribe();
  }

  onChange(event) {
    const { value } = event.currentTarget;
    this.props.dispatcher.set(parseFloat(value));
  }

  get descriptionPopup() {
    let { description } = this.props;
    const { MaximumValue, MinimumValue } = description.AdditionalData;
    const descriptionString = `${description.description}\nMin: ${MinimumValue}, max: ${MaximumValue}`;
    return descriptionString ? (<InfoBox text={descriptionString} />) : '';
  }

  render() {
    const { description, value } = this.props;
    const { SteppingValue, MaximumValue, MinimumValue } = description.AdditionalData;
    return (
      <NumericInput
        value={value}
        label={(<span>{description.Name} {this.descriptionPopup}</span>)}
        placeholder={description.Name}
        onChange={this.onChange}
        step={SteppingValue}
        max={MaximumValue}
        min={MinimumValue}
        disabled={this.disabled}
      />
    );
  }
}

export default NumericProperty;
