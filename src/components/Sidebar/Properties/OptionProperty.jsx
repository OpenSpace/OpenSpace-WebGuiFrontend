import React from 'react';
import PropTypes from 'prop-types';

import Select from '../../common/Input/Select/Select';

import PropertyLabel from './PropertyLabel';

function OptionProperty({
  description,
  disabled,
  dispatcher,
  value
}) {
  function onChange(newSelection) {
    // 10 is the base, radix, for parsing the int
    dispatcher.set(parseInt(newSelection.value, 10));
  }

  const label = <PropertyLabel description={description} />;

  const options = description.AdditionalData.Options
    .map((option) => ({
      label: Object.values(option)[0],
      value: (`${Object.keys(option)[0]}`),
      isSelected: (`${Object.keys(option)[0]}`) === (`${value}`)
    }));

  return (
    <Select
      label={label}
      options={options}
      onChange={onChange}
      disabled={disabled}
      value={value}
    />
  );
}

OptionProperty.propTypes = {
  description: PropTypes.shape({
    Identifier: PropTypes.string,
    Name: PropTypes.string,
    MetaData: PropTypes.shape({
      isReadOnly: PropTypes.bool
    }),
    AdditionalData: PropTypes.shape({
      Options: PropTypes.array
    }),
    description: PropTypes.string
  }).isRequired,
  disabled: PropTypes.bool.isRequired,
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

export default OptionProperty;
