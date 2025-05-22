import React from 'react';
import PropTypes from 'prop-types';

import Select from '../../common/Input/Select/Select';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function OptionProperty({ metaData, dispatcher, value }) {
  const disabled = metaData.isReadOnly;

  function onChange(newSelection) {
    // 10 is the base, radix, for parsing the int
    dispatcher.set(parseInt(newSelection.value, 10));
  }

  const options = Object.entries(metaData.additionalData.options).map(([key, label]) => ({
    label: label,
    value: `${key}`,
    isSelected: `${key}` === `${value}`
  }));

  return (
    <div className={`${disabled ? styles.disabled : ''}`}>
      <Select
        label={<PropertyLabel metaData={metaData} />}
        options={options}
        onChange={onChange}
        disabled={disabled}
        value={value}
      />
    </div>
  );
}

OptionProperty.propTypes = {
  metaData: PropTypes.shape({
    identifier: PropTypes.string,
    guiName: PropTypes.string,
    isReadOnly: PropTypes.bool,
    additionalData: PropTypes.shape({
      options: PropTypes.object
    }),
    description: PropTypes.string
  }).isRequired,
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

export default OptionProperty;
