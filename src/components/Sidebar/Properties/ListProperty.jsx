import React from 'react';
import PropTypes from 'prop-types';

import Input from '../../common/Input/Input/Input';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function ListProperty({ description, dispatcher, value }) {
  const disabled = description.MetaData.isReadOnly;

  function onChange(evt) {
    const newValue = evt.target.value.trim();

    if (newValue === '') {
      dispatcher.set({});
      return;
    }

    dispatcher.set(newValue.split(','));
  }

  const label = <PropertyLabel description={description} />;

  return (
    <div className={`${disabled ? styles.disabled : ''}`}>
      <Input
        value={value.join(',')}
        label={label}
        placeholder={description.Name}
        onEnter={onChange}
        disabled={disabled}
      />
    </div>
  );
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
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

export default ListProperty;
