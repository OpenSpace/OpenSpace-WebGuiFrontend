import React from 'react';
import PropTypes from 'prop-types';

import Input from '../../common/Input/Input/Input';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function StringProperty({ metaData, dispatcher, value }) {
  const disabled = metaData.isReadOnly;

  function onChange(evt) {
    const newValue = evt.target.value;
    dispatcher.set(newValue);
  }

  return (
    <div className={`${disabled ? styles.disabled : ''}`}>
      <Input
        value={value}
        label={<PropertyLabel metaData={metaData} />}
        placeholder={metaData.guiName}
        onEnter={onChange}
        disabled={metaData.isReadOnly}
      />
    </div>
  );
}

StringProperty.propTypes = {
  metaData: PropTypes.shape({
    identifier: PropTypes.string,
    guiName: PropTypes.string,
    isReadOnly: PropTypes.bool,
    description: PropTypes.string
  }).isRequired,
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

export default StringProperty;
