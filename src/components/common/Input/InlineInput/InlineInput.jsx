import React, { Component } from 'react';
import AutosizeInput from 'react-input-autosize';
import PropTypes from 'prop-types';

import Input from '../Input/Input';

import styles from './InlineInput.scss';

function InlineInput({className, type, value, onEnter, onChange, noExtraWidth, id, ...props}) {
  const [focus, setFocus] = React.useState(false);
  const [storedValue, setStoredValue] = React.useState(value);

  if (value !== storedValue && !focus) {
    setStoredValue(value);
  }

  function onBlur(event) {
    setFocus(false);
    onEnter(event);
  }

  function onKeyUp(event) {
    if (event.key === 'Enter') {
      onEnter(event);
    }
  }

  function onChange(event) {
    const { value : newValue } = event.currentTarget;
    setStoredValue(newValue);
    onChange(event);
  }

  return (
    <AutosizeInput
      {...props}
      id={id || `inlineinput-${Input.nextId}`}
      value={storedValue}
      onChange={onChange}
      onKeyUp={onKeyUp}
      onBlur={onBlur}
      onFocus={() => setFocus(true)}
      className={`${styles.input} ${props.className}`}
      extraWidth={noExtraWidth ? 0 : undefined}
    />
  );
}

InlineInput.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  onChange: PropTypes.func,
  onEnter: PropTypes.func,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  noExtraWidth: PropTypes.bool
};

InlineInput.defaultProps = {
  className: '',
  id: null,
  onChange: () => {},
  onEnter: () => {},
  type: 'text',
  value: '',
  noExtraWidth: false
};

export default InlineInput;
