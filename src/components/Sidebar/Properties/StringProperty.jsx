import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Input from '../../common/Input/Input/Input';
import InfoBox from '../../common/InfoBox/InfoBox';

class StringProperty extends Component {
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

  get descriptionPopup() {
    const { description } = this.props.description;
    return description ? (<InfoBox text={description} />) : '';
  }

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
  }

  onChange(evt) {
    const value = evt.target.value;
    this.props.dispatcher.set(value);
  }

  render() {
    const { description, value } = this.props;
    const placeholder = (<span>
      { description.Name } { this.descriptionPopup }
    </span>);
    return (
      <Input
        value={value}
        label={placeholder}
        placeholder={description.Name}
        onEnter={this.onChange}
        disabled={this.disabled}
      />
    );
  }
}

StringProperty.propTypes = {
  description: PropTypes.shape({
    Identifier: PropTypes.string,
    Name: PropTypes.string,
    MetaData: PropTypes.shape({
      isReadOnly: PropTypes.bool,
    }),
    description: PropTypes.string,
  }).isRequired,
  value: PropTypes.any
};

export default StringProperty;
