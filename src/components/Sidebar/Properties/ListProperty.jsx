import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Input from '../../common/Input/Input/Input';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

class ListProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
  }

  onChange(evt) {
    const value = evt.target.value.trim();

    if (value === '') {
      this.props.dispatcher.set({});
      return;
    }

    this.props.dispatcher.set(value.split(','));
  }

  render() {
    const { description, value } = this.props;
    const label = <PropertyLabel description={description} />;
    return (
      <div className={`${this.disabled ? styles.disabled : ''}`}>
        <Input
          value={value.join(',')}
          label={label}
          placeholder={description.Name}
          onEnter={this.onChange}
          disabled={this.disabled}
        />
      </div>
    );
  }
}

ListProperty.propTypes = {
  description: PropTypes.shape({
    Identifier: PropTypes.string,
    Name: PropTypes.string,
    MetaData: PropTypes.shape({
      isReadOnly: PropTypes.bool
    }),
    description: PropTypes.string
  }).isRequired,
  value: PropTypes.any
};

export default ListProperty;
