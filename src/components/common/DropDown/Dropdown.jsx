import React from 'react';

import Button from '../Input/Button/Button';

import styles from './Dropdown.scss';

const DEFAULT_PLACEHOLDER_STRING = 'Select...';

function Dropdown({
  value, placeholder, options, onFocus, disabled, onChange, ...props
}) {
  const [selected, setSelected] = React.useState(value || {
    label: typeof placeholder === 'undefined' ? DEFAULT_PLACEHOLDER_STRING : placeholder,
    value: ''
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const mounted = React.useRef(true);
  const dropdownRef = React.useRef(null);

  // Add and remove event listeners
  React.useEffect(() => {
    function handleDocumentClick(event) {
      if (mounted.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
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
      if (selected.value !== value) {
        setSelected(value);
      }
    } else {
      setSelected({
        label: typeof placeholder === 'undefined' ? DEFAULT_PLACEHOLDER_STRING : placeholder,
        value: ''
      });
    }
  }, [value]);

  function handleMouseDown(event) {
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

  function fireChangeEvent(newSelected) {
    if (newSelected !== selected && onChange) {
      onChange(newSelected);
    }
  }

  function setValue(newValue, label) {
    fireChangeEvent({ value: newValue, label });
    setSelected({ value: newValue, label });
    setIsOpen(false);
  }

  function buildMenu() {
    const optionDivs = options.map((option) => {
      let newValue = option.value;
      if (typeof newValue === 'undefined') {
        newValue = option.label || option;
      }
      const label = option.label || option.value || option;
      const isSelected = newValue === selected.value || newValue === selected;
      return (
        <Button
          key={newValue}
          className={`${styles.DropdownOption} ${isSelected && styles.isSelected}`}
          onMouseDown={() => setValue(newValue, label)}
          onClick={() => setValue(newValue, label)}
          aria-selected={isSelected ? 'true' : 'false'}
        >
          {label}
        </Button>
      );
    });

    return optionDivs.length > 0 ?
      optionDivs :
      <div className={styles.DropdownNoresults}>No options found</div>;
  }

  return (
    <div ref={dropdownRef} className={styles.DropdownRoot} {...props}>
      <Button
        className={styles.DropdownControl}
        onMouseDown={handleMouseDown}
        onTouchEnd={handleMouseDown}
        aria-haspopup="listbox"
      >
        <div className={styles.DropdownPlaceholder}>
          {typeof selected === 'string' ? selected : selected.label}
        </div>
        <div className={styles.DropdownArrowWrapper}>
          <span className={styles.DropdownArrow} />
        </div>
      </Button>
      {isOpen && (
        <div className={styles.DropdownMenu} aria-expanded="true" {...props}>
          {buildMenu()}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
