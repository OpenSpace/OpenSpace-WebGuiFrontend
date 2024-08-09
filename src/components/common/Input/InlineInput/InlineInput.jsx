import React from 'react';
import PropTypes from 'prop-types';

import Input from '../Input/Input';

import styles from './InlineInput.scss';

/**
 * This component is as bit of a hack, due to a temporary fix ot replace a dependency that was no
 * longer being maintained. Eventually, it should be replaced or rewritten. It currently always
 * autosizes based on the current input
 *
 * For now, just make it work. It is only used in the Time component, which requires some
 * improvements anyways (e.g. for validating input). When that component is fixed, this one should
 * be looked at again. // Emma (2024-08-09)
 */
function InlineInput({
  className = '',
  id = null,
  onChange = () => {},
  onEnter = () => {},
  type = 'text',
  value = '',
  ...props
}) {
  const [storedValue, setStoredValue] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);

  // Autosize based on input
  const [width, setWidth] = React.useState(0);
  const span = React.useRef();

  React.useEffect(() => {
    setWidth(span.current.clientWidth);
  }, [storedValue]);

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
      event.currentTarget.blur();
    }
  }

  function onInputChange(event) {
    setStoredValue(event.target.value);
    onChange(event);
  }

  const hideStyle = {
    opacity: '0',
    // To place it on top over and behind the actual input
    position: 'absolute',
    zIndex: -1
  };

  return (
    <div>
      <span style={hideStyle} ref={span}>{storedValue}</span>
      <input
        {...props}
        className={`${styles.input} ${className}`}
        style={{ width }}
        id={id || `inlineinput-${Input.nextId}`}
        value={storedValue}
        onChange={onInputChange}
        onKeyUp={onKeyUp}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    </div>
  );
}

InlineInput.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  onChange: PropTypes.func,
  onEnter: PropTypes.func,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default InlineInput;
