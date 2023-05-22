import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Input from '../../common/Input/Input/Input';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

class StringProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(evt) {
    const { value } = evt.target;
    this.props.dispatcher.set(value);
  }

  render() {
    const { description, value } = this.props;
    return (
      <div className={`${this.disabled ? styles.disabled : ''}`}>
        <Input
          value={value}
          label={<PropertyLabel description={description} />}
          placeholder={description.Name}
          onEnter={this.onChange}
          disabled={description.MetaData.isReadOnly}
        />
      </div>
    );
  }
}

StringProperty.propTypes = {
  description: PropTypes.shape({
    Identifier: PropTypes.string,
    Name: PropTypes.string,
    MetaData: PropTypes.shape({
      isReadOnly: PropTypes.bool
    }),
    description: PropTypes.string
  }).isRequired,
  value: PropTypes.any.isRequired
};

export default StringProperty;
