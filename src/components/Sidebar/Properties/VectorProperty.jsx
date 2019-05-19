import React, { Component } from 'react';
import NumericInput from '../../common/Input/NumericInput/NumericInput';
import Row from '../../common/Row/Row';
import InfoBox from '../../common/InfoBox/InfoBox';
import styles from './Property.scss';
import { connectProperty } from './connectProperty';

class VectorProperty extends Component {
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

  onChange(index) {
    return (event) => {
      const stateValue = this.props.value;
      const { value } = event.currentTarget;

      stateValue[index] = parseFloat(value);
      this.props.dispatcher.set(stateValue);
    };
  }

  render() {
    const { description } = this.props;
    const { SteppingValue, MaximumValue, MinimumValue } = description.AdditionalData;
    const firstLabel = (<span>
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
            onChange={this.onChange(index)}
            step={SteppingValue[index]}
            max={MaximumValue[index]}
            min={MinimumValue[index]}
            disabled={this.disabled}
          />
        ))}
      </Row>
    );
  }
}

export default VectorProperty;
