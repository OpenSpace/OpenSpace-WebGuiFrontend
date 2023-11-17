import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '../../common/Input/Checkbox/Checkbox';

import PropertyLabel from './PropertyLabel';

function BoolProperty({
  checkBoxOnly, disabled, description, dispatcher, value
}) {
  const showText = !checkBoxOnly;

  function onChange(newValue) {
    dispatcher.set(newValue);
  }

  return (
    <Checkbox
      wide={!checkBoxOnly}
      checked={value}
      setChecked={onChange}
      disabled={disabled}
    >
      {showText && <PropertyLabel description={description} />}
    </Checkbox>
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
  disabled: PropTypes.bool.isRequired,
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

BoolProperty.defaultProps = {
  checkBoxOnly: false
};

export default BoolProperty;
