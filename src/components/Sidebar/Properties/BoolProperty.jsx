import React from 'react';
import Property from './Property';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import { connectProperty } from './connectProperty';

class BoolProperty extends Property {
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
    const { Description, Value } = this.props;
    const showText = !this.props.checkBoxOnly;

    return (
      <Checkbox
        checked={Value}
        label={showText ? (<span>{Description.Name} {this.descriptionPopup}</span>) : null}
        onChange={this.onChange}
        disabled={this.disabled}
      />
    );
  }
}

BoolProperty = connectProperty(BoolProperty);
export default BoolProperty;
