import React from 'react';
import { MdCancel } from 'react-icons/md';
import PropTypes from 'prop-types';

import styles from './Input.scss';

function Input({
  children = [],
  className = '',
  clearable = false,
  label = null,
  loading = false,
  onChange = () => {},
  onEnter = () => {},
  placeholder,
  value = '',
  wide = true,
  step = 1,
  ...props
}) {
  const [storedValue, setStoredValue] = React.useState(value);
  const hasInput = storedValue !== '';

  const inputNode = React.useRef(null);
  const id = React.useRef(`input-${Input.nextId}`);

  React.useEffect(() => {
    setStoredValue(value);
  }, [value]);

  /**
   * callback for input
   * @param event InputEvent
   */
  function onInputChange(event) {
    // update state so that input is re-rendered with new content
    setStoredValue(event.target.value);

    // send to the onChange (if any)!
    onChange(event);
  }

  function onKeyUp(event) {
    if (event.key === 'Enter') {
      onEnter(event);
    }
  }

  /**
   * clear the input field
   */
  function clear() {
    setStoredValue('');

    // trigger onchange event on input
    inputNode.current.value = '';
    const event = new CustomEvent('clear');
    inputNode.current.dispatchEvent(event);
    onInputChange(event);
    inputNode.current.focus();
  }

  return (
    <div className={`${styles.group} ${wide ? styles.wide : ''}`}>
      <input
        className={`${className} ${styles.input}
                      ${hasInput ? styles.hasinput : ''}
                      ${loading ? styles.loading : ''}
                      ${wide ? styles.wide : ''}`}
        id={id.current}
        onChange={onInputChange}
        onKeyUp={onKeyUp}
        value={storedValue}
        ref={inputNode}
        placeholder={placeholder}
        label={label}
        step={step}
        autoComplete="off"
        {...props}
      />
      <label htmlFor={id.current} className={`${styles.label} ${hasInput && styles.hasinput}`}>
        { label || placeholder }
      </label>
      <div className={styles.buttonsContainer}>
        { children }
        { clearable && (
          <MdCancel
            className={`${styles.clearbutton} ${hasInput && styles.hasinput}`}
            onClick={clear}
            tabIndex="0"
            role="button"
            title="Clear input field"
          />
        )}
      </div>
    </div>
  );
}

Input.idCounter = Input.idCounter || 1;
Input.nextId = () => Input.idCounter++;

Input.propTypes = {
  onChange: PropTypes.func,
  onEnter: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  clearable: PropTypes.bool,
  label: PropTypes.node,
  loading: PropTypes.bool,
  placeholder: PropTypes.string.isRequired,
  step: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  wide: PropTypes.bool
};

export default Input;
