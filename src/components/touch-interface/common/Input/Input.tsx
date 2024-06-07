import React, {
  ChangeEvent,
  KeyboardEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState
} from 'react';
import { MdCancel } from 'react-icons/md';
import PropTypes from 'prop-types';

import styles from './Input.scss';

interface InputProps {
  children?: React.ReactNode;
  className?: string;
  clearable?: boolean;
  label?: React.ReactNode;
  loading?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onEnter?: (event: KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  value?: string | number;
  wide?: boolean;
  step?: number;
  autoFocus?: boolean;
}

let idCounter = 1;
const nextId = () => idCounter++;

const Input: React.FC<InputProps> = ({
  children,
  className,
  clearable,
  label,
  loading,
  onChange,
  onEnter,
  placeholder,
  value,
  wide,
  step,
  autoFocus,
  ...props
}) => {
  const [storedValue, setStoredValue] = React.useState(value);
  const hasInput = storedValue !== '';

  const inputNode = useRef<HTMLInputElement>(null);
  const id = useRef(`input-${nextId()}`);

  React.useEffect(() => {
    setStoredValue(value);
  }, [value]);

  /**
   * callback for input
   * @param event InputEvent
   */
  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    // update state so that input is re-rendered with new content
    setStoredValue(event.target.value);

    // send to the onChange (if any)!
    onChange?.(event);
  }

  function onKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      onEnter?.(event);
    }
  }

  /**
   * clear the input field
   */
  function clear() {
    if (inputNode.current) {
      setStoredValue('');
      inputNode.current.value = '';
      const event = new CustomEvent('clear');
      inputNode.current.dispatchEvent(event);
      onInputChange(event as unknown as ChangeEvent<HTMLInputElement>);
      inputNode.current.focus();
    }
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
        step={step}
        autoFocus={autoFocus}
        autoComplete='off'
        {...props}
      />
      {/* <label htmlFor={id.current} className={`${styles.label} ${hasInput && styles.hasinput}`}>
        {label || placeholder}
      </label> */}
      <div className={styles.buttonsContainer}>
        {children}
        {clearable && (
          <MdCancel
            className={`${styles.clearbutton} ${hasInput && styles.hasinput}`}
            onClick={clear}
            tabIndex={0}
            role='button'
            title='Clear input field'
          />
        )}
      </div>
    </div>
  );
};

// Input.idCounter = Input.idCounter || 1;
// Input.nextId = () => Input.idCounter++;

export default Input;
