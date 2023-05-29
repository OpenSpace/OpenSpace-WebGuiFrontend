import React from 'react';
import ReactSelect from 'react-select';
import PropTypes from 'prop-types';

import { excludeKeys } from '../../../../utils/helpers';
import Input from '../Input/Input';

import styles from './Select.scss';

const selectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#222',
    borderWidth: 0,
    boxShadow: 'none',
    height: 41
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#222',
    margin: 0,
    zIndex: 10
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#D9DA6D'
  }),
  indicatorSeparator: () => ({
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    ':hover': {
      color: '#fff'
    },
    color: '#999',
    paddingRight: 8
  }),
  option: (provided, state) => ({
    ...excludeKeys(provided, ':active'),
    color: '#FFF',
    backgroundColor: state.isFocused ? '#333' : '#222'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'inherited',
    paddingTop: 10,
    marginLeft: 0
  })
};

function Select({
  value, label, id, disabled, options, onChange, ...props
}) {
  const identifier = id || `select-${Input.nextId}`;

  return (
    <div className={styles.selectgroup}>
      <ReactSelect
        {...props}
        id={identifier}
        isDisabled={disabled}
        placeholder={label}
        styles={selectStyles}
        options={options}
        onChange={onChange}
        // Convert to string to ensure both are the same type
        value={options.filter((opt) => `${opt.value}` === `${value}`)}
        blurInputOnSelect
      />
      {value !== undefined && (
        <label htmlFor={id} className={styles.selectlabel}>
          {label}
        </label>
      )}
    </div>
  );
}

Select.propTypes = {
  clearable: PropTypes.bool,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  label: PropTypes.node.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string
    })
  ).isRequired,
  searchable: PropTypes.bool,
  value: PropTypes.node
};

Select.defaultProps = {
  clearable: false,
  disabled: false,
  id: null,
  onChange: () => {},
  searchable: false,
  value: undefined
};

export default Select;
