import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Input from '../../common/Input/Input/Input';

import styles from './Property.scss';
import PropertyLabel from './PropertyLabel';

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

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
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
          disabled={this.disabled}
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
  value: PropTypes.any
};

export default StringProperty;
