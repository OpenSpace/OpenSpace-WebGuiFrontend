import React, { Component } from 'react';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import { connectProperty } from './connectProperty';
import InfoBox from '../../common/InfoBox/InfoBox';

class BoolProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
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
    return description ? <InfoBox text={description} /> : '';
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
