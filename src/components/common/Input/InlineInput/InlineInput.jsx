import React from 'react';
import AutosizeInput from 'react-input-autosize';
import PropTypes from 'prop-types';

import Input from '../Input/Input';

import styles from './InlineInput.scss';

function InlineInput({
  className, type, value, onEnter, onChange, noExtraWidth, id, ...props
}) {
  const [storedValue, setStoredValue] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (storedValue !== value && !isFocused) {
      setStoredValue(value);
    }
  }, [value]);

  function onFocus() {
    setIsFocused(true);
  }

  function onBlur(event) {
    setIsFocused(false);
    onEnter(event);
  }

  function onKeyUp(event) {
    if (event.key === 'Enter') {
      onEnter(event);
    }
  }

  function onInputChange(event) {
    setStoredValue(event.target.value);
    onChange(event);
  }

  return (
    <AutosizeInput
      {...props}
      id={id || `inlineinput-${Input.nextId}`}
      value={storedValue}
      onChange={onInputChange}
      onKeyUp={onKeyUp}
      onBlur={onBlur}
      onFocus={onFocus}
      className={`${styles.input} ${className}`}
      extraWidth={noExtraWidth ? 0 : undefined}
      tabIndex={0}
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
