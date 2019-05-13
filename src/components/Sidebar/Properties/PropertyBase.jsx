import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Input from '../../common/Input/Input/Input';
import InfoBox from '../../common/InfoBox/InfoBox';

class PropertyBase extends Component {
  constructor(props) {
    super(props);
  }

  get uri() {
    const { Identifier } = this.props.Description;
    return Identifier;
  }

  get inputType() {
    const { description } = this.props;
    switch (description.Type) {
      case 'StringProperty':
      default:
        return Input;
    }
  }

  get descriptionPopup() {
    const { description } = this.props.description;
    return description ? (<InfoBox text={description} />) : '';
  }

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
  }

  render() {
    const { description, value } = this.props;
    const PropInput = this.inputType;
    const placeholder = (<span>
      { description.Name } { this.descriptionPopup }
    </span>);
    return (
      <PropInput
        value={value}
        label={placeholder}
        placeholder={Description.Name}
        onChange={this.onChange}
        disabled={this.disabled}
      />
    );
  }
}

PropertyBase.propTypes = {
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

export default PropertyBase;
