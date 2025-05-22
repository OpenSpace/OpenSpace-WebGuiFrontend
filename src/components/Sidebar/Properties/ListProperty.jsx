import React from 'react';
import PropTypes from 'prop-types';

import Input from '../../common/Input/Input/Input';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function ListProperty({ metaData, dispatcher, value }) {
  const disabled = metaData.isReadOnly;

  function onChange(evt) {
    const newValue = evt.target.value.trim();

    if (newValue === '') {
      dispatcher.set({});
      return;
    }

    dispatcher.set(newValue.split(','));
  }

  const label = <PropertyLabel metaData={metaData} />;

  return (
    <div className={`${disabled ? styles.disabled : ''}`}>
      <Input
        value={value.join(',')}
        label={label}
        placeholder={metaData.guiName}
        onEnter={onChange}
        disabled={disabled}
      />
    </div>
  );
}

ListProperty.propTypes = {
  metaData: PropTypes.shape({
    identifier: PropTypes.string,
    guiName: PropTypes.string,
    isReadOnly: PropTypes.bool,
    description: PropTypes.string
  }).isRequired,
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

export default ListProperty;
