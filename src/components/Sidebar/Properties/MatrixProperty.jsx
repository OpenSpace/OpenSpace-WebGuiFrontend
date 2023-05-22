import React, { Component } from 'react';

import NumericInput from '../../common/Input/NumericInput/NumericInput';
import Row from '../../common/Row/Row';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

class MatrixProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(index) {
    return (newValue) => {
      const stateValue = this.props.value;
      stateValue[index] = parseFloat(newValue);
      this.props.dispatcher.set(stateValue);
    };
  }

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
  }

  render() {
    const { description, value } = this.props;
    const {
      SteppingValue, MaximumValue, MinimumValue, Exponent
    } = description.AdditionalData;
    const firstLabel = <PropertyLabel description={description} />;

    const values = value.map((val, index) => ({
      key: `${description.Name}-${index}`,
      value: parseFloat(val),
      index
    }));
    // Find N
    const matrixSize = Math.sqrt(values.length);
    // actually convert into N arrays of N length
    const groups = Array.from(new Array(matrixSize), () => values.splice(0, matrixSize));

    // eslint-disable react/no-array-index-key
    return (
      <div className={`${styles.matrixProperty} ${this.disabled ? styles.disabled : ''}`}>
        { groups.map((group) => (
          <Row key={`row-${group[0].key}`}>
            { group.map((comp) => (
              <NumericInput
                inputOnly
                key={comp.key}
                value={comp.value}
                label={comp.index === 0 ? firstLabel : ' '}
                placeholder={`value ${comp.index}`}
                onValueChanged={this.onChange(comp.index)}
                exponent={Exponent}
                step={SteppingValue[comp.index] || 0.01}
                max={MaximumValue[comp.index] || 100}
                min={MinimumValue[comp.index] || -100}
                disabled={this.disabled}
                noTooltip
              />
            ))}
          </Row>
        ))}
      </div>
    );
  }
}

export default MatrixProperty;
