import React, { Component } from 'react';

import Select from '../../common/Input/Select/Select';

import styles from './Property.scss';
import PropertyLabel from './PropertyLabel';

class OptionProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange({ value }) {
    this.props.dispatcher.set(parseInt(value));
  }

  componentDidMount() {
    this.props.dispatcher.subscribe();
  }

  componentWillUnmount() {
    this.props.dispatcher.unsubscribe();
  }

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
  }

  render() {
    const { description, value } = this.props;
    const label = <PropertyLabel description={description} />;

    const options = description.AdditionalData.Options
      .map((option) => ({
        label: Object.values(option)[0],
        value: (`${Object.keys(option)[0]}`),
        isSelected: (`${Object.keys(option)[0]}`) === (`${value}`)
      }));

    return (
      <div className={`${this.disabled ? styles.disabled : ''}`}>
        <Select
          label={label}
          options={options}
          onChange={this.onChange}
          disabled={this.disabled}
          value={value}
        />
      </div>
    );
  }
}

export default OptionProperty;
