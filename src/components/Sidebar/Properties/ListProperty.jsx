import React from 'react';
import PropTypes from 'prop-types';

import Input from '../../common/Input/Input/Input';

import PropertyLabel from './PropertyLabel';

function ListProperty({
  description,
  disabled,
  dispatcher,
  value
}) {
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
    <Input
      value={value.join(',')}
      label={label}
      placeholder={description.Name}
      onEnter={onChange}
      disabled={disabled}
    />
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
  disabled: PropTypes.bool.isRequired,
  value: PropTypes.any.isRequired
};

export default ListProperty;
