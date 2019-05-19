import React, { Component } from 'react';
import Select from '../../common/Input/Select/Select';
import InfoBox from '../../common/InfoBox/InfoBox';
import { connectProperty } from './connectProperty';

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

  get descriptionPopup() {
    const { description } = this.props.description;
    return description ? <InfoBox text={description} /> : '';
  }

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
  }

  render() {
    const { description, value } = this.props;
    const label = (
      <span>
        { description.Name } { this.descriptionPopup }
      </span>
    );
    const options = description.AdditionalData.Options
      .map(option => ({ label: Object.values(option)[0], value: Object.keys(option)[0] }));
    return (
      <Select
        label={label}
        options={options}
        value={value}
        onChange={this.onChange}
        disabled={this.disabled}
      />
    );
  }
}

export default OptionProperty;
