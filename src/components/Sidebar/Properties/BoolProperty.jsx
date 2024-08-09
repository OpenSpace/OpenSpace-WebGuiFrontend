import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '../../common/Input/Checkbox/Checkbox';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function BoolProperty({
  checkBoxOnly = false, description, dispatcher, value
}) {
  const disabled = description.MetaData.isReadOnly;
  const showText = !checkBoxOnly;

  function onChange(newValue) {
    dispatcher.set(newValue);
  }

  return (
    <div className={`${disabled ? styles.disabled : ''}`}>
      <Checkbox
        wide={!checkBoxOnly}
        checked={value}
        setChecked={onChange}
        disabled={disabled}
      >
        {showText && <PropertyLabel description={description} />}
      </Checkbox>
    </div>
  );
}

BoolProperty.propTypes = {
  checkBoxOnly: PropTypes.bool,
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

export default BoolProperty;
