import React from 'react';
import PropertyBase from './PropertyBase';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import { connectProperty } from './connectProperty';

class BoolProperty extends PropertyBase {
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

BoolProperty = connectProperty(BoolProperty);
export default BoolProperty;
