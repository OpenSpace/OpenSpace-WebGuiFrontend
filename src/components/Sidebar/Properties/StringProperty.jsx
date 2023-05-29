import React from 'react';
import PropTypes from 'prop-types';

import Input from '../../common/Input/Input/Input';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function StringProperty({ description, dispatcher, value }) {
  const disabled = description.MetaData.isReadOnly;

  function onChange() {
    dispatcher.set(value);
  }

  return (
    <div className={`${disabled ? styles.disabled : ''}`}>
      <Input
        value={value}
        label={<PropertyLabel description={description} />}
        placeholder={description.Name}
        onEnter={onChange}
        disabled={description.MetaData.isReadOnly}
      />
    </div>
  );
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
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

export default StringProperty;
