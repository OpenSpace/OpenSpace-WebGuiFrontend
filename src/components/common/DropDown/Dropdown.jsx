import React, { Component, createRef } from 'react';
import styles from './Dropdown.scss';

const DEFAULT_PLACEHOLDER_STRING = 'Select...';

function Dropdown({value, placeholder, options, onFocus, disabled, onChange, ...props}) {
  const [selected, setSelected] = React.useState(value || {
    label: typeof placeholder === 'undefined' ? DEFAULT_PLACEHOLDER_STRING : placeholder,
    value: ''
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const mounted = React.useRef(true);
  const dropdownRef = React.useRef(null);
  
  // Add and remove event listeners
  React.useEffect(() => {
    document.addEventListener('click', handleDocumentClick, false);
    document.addEventListener('touchend', handleDocumentClick, false);
    return () => {
      mounted.current = false;
      document.removeEventListener('click', handleDocumentClick, false);
      document.removeEventListener('touchend', handleDocumentClick, false);
    };
  }, []);

  // Re-render when the value changes
  React.useEffect(() => {
    if (value) {
      if (selected !== value) {
        setSelected(value);
      }
    }
    else {
      setSelected({
          label: typeof placeholder === 'undefined' ? DEFAULT_PLACEHOLDER_STRING : placeholder,
          value: ''
      });
    }
  }, [value]);

  function handleMouseDown (event) {
    if (onFocus && typeof onFocus === 'function') {
      onFocus(isOpen);
    }
    if (event.type === 'mousedown' && event.button !== 0) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();

    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }

  function setValue (value, label) {
    fireChangeEvent({ value, label });
    setSelected({ value, label });
    setIsOpen(false);
  }

  function fireChangeEvent (newSelected) {
    if (newSelected !== selected && onChange) {
      onChange(newSelected);
    }
  }

  function buildMenu () {
    const optionDivs = options.map((option) => {
      let value = option.value;
      if (typeof value === 'undefined') {
        value = option.label || option;
      }
      const label = option.label || option.value || option;
      const isSelected = value === selected.value || value === selected;

      return (
        <div
          key={value}
          className={`${styles.DropdownOption} ${isSelected && styles.isSelected}`}
          onMouseDown={() => setValue(value, label)}
          onClick={() => setValue(value, label)}
          role='option'
          aria-selected={isSelected ? 'true' : 'false'}
        >
          {label}
        </div>
      );
    });

    return optionDivs.length > 0 ?
      optionDivs :
      <div className={styles.DropdownNoresults}>No options found</div>;
  }

  function handleDocumentClick(event) {
    if (mounted.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }

  return (
    <div ref={dropdownRef} className={styles.DropdownRoot} {...props}>
      <div
        className={styles.DropdownControl}
        onMouseDown={handleMouseDown}
        onTouchEnd={handleMouseDown}
        aria-haspopup='listbox'
      >
        <div className={styles.DropdownPlaceholder}>
          {typeof selected === 'string' ? selected : selected.label}
        </div>
        <div className={styles.DropdownArrowWrapper}>
          <span className={styles.DropdownArrow} />
        </div>
      </div>
      {isOpen && (
        <div className={styles.DropdownMenu} aria-expanded='true' {...props}>
          {buildMenu()}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
