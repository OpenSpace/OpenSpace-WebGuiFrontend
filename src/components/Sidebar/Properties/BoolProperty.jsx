import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '../../common/Input/Checkbox/Checkbox';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function BoolProperty({ checkBoxOnly, metaData, dispatcher, value }) {
  const disabled = metaData.isReadOnly;
  const showText = !checkBoxOnly;

  function onChange(newValue) {
    dispatcher.set(newValue);
  }

  return (
    <div className={`${disabled ? styles.disabled : ''}`}>
      <Checkbox wide={!checkBoxOnly} checked={value} setChecked={onChange} disabled={disabled}>
        {showText && <PropertyLabel metaData={metaData} />}
      </Checkbox>
    </div>
  );
}

BoolProperty.propTypes = {
  checkBoxOnly: PropTypes.bool,
  metaData: PropTypes.shape({
    identifier: PropTypes.string,
    name: PropTypes.string,
    isReadOnly: PropTypes.bool,
    description: PropTypes.string
  }).isRequired,
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

BoolProperty.defaultProps = {
  checkBoxOnly: false
};

export default BoolProperty;
