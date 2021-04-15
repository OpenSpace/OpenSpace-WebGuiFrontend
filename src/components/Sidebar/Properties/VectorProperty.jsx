import React, { Component } from 'react';
import NumericInput from '../../common/Input/NumericInput/NumericInput';
import Row from '../../common/Row/Row';
import InfoBox from '../../common/InfoBox/InfoBox';
import styles from './Property.scss';
import { copyTextToClipboard } from '../../../utils/helpers';
import ColorPickerPopup from '../../common/ColorPicker/ColorPickerPopup';

class VectorProperty extends Component {
  constructor(props) {
    super(props);

    this.copyUri = this.copyUri.bind(this);
    this.valueToColor = this.valueToColor.bind(this);
    this.onColorPickerChange = this.onColorPickerChange.bind(this);
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

  copyUri() {
    copyTextToClipboard(this.props.description.Identifier);
  }

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
  }

  get logarithmicView() {
    return this.props.description.MetaData.ViewOptions.Logarithmic;
  }

  get isColor() {
    if(this.props.value.length < 3 || this.props.value.length > 4) {
      return false;
    }
    return this.props.description.MetaData.ViewOptions.Color;
  }

  get hasAlpha() {
    return this.isColor && this.props.value.length == 4;
  }

  valueToColor() {
    if(!this.isColor) { return null; }
    const {value} = this.props;

    return {
        r: value[0] * 255,
        g: value[1] * 255,
        b: value[2] * 255,
        a: this.hasAlpha ? value[3]: 1.0
    }
  }

  onChange(index) {
    return (newValue) => {
      const stateValue = this.props.value;

      stateValue[index] = parseFloat(newValue);
      this.props.dispatcher.set(stateValue);
    };
  }

  onColorPickerChange(color) {
    const rgb = color.rgb;
    let newValue = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    if(this.hasAlpha) {
      newValue[3] = rgb.a;
    }
    
    // Avoid creating numbers with lots of decimals
    newValue = newValue.map((v) => parseFloat(v.toFixed(3)));

    this.props.dispatcher.set(newValue);
  }

  render() {
    const { description } = this.props;
    const { SteppingValue, MaximumValue, MinimumValue } = description.AdditionalData;
    const firstLabel = (<span onClick={this.copyUri}>
      { description.Name } { this.descriptionPopup }
    </span>);

    // eslint-disable-next-line react/no-array-index-key
    const values = this.props.value
      .map((value, index) => ({ key: `${description.Name}-${index}`, value }));

    return (
      <Row className={styles.vectorProperty}>
        { values.map((component, index) => (
          <NumericInput
            key={component.key}
            value={component.value}
            label={index === 0 ? firstLabel : ' '}
            placeholder={`value ${index}`}
            onValueChanged={this.onChange(index)}
            step={SteppingValue[index]}
            max={MaximumValue[index]}
            min={MinimumValue[index]}
            disabled={this.disabled}
            logarithmicScale={this.logarithmicView}
          />
        ))}
        { this.isColor && (
          <ColorPickerPopup
            disableAlpha={!this.hasAlpha}
            color={this.valueToColor()}
            onChange={this.onColorPickerChange}
            placement="right"
          />
        )}
      </Row>
    );
  }
}

export default VectorProperty;
