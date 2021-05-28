import React from 'react';
import PropTypes from 'prop-types';
import ReactSelect from 'react-select';
import Input from '../Input/Input';
import styles from './Select.scss';
import { excludeKeys } from '../../../../utils/helpers';

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
  singleValue: (provided, state) => ({
    ...provided,
    color: 'inherited',
    paddingTop: 10,
    marginLeft: 0
  })
};

const Select = (props) => {
  const { value, label } = props;
  const inheritedProps = excludeKeys(props, 'label');
  const id = props.id || `select-${Input.nextId}`;

  return (
    <div className={styles.selectgroup}>
      <ReactSelect
        {...inheritedProps}
        id={id}
        placeholder={label}
        styles={selectStyles}
        value={inheritedProps.options.filter(opt => opt.value == value)}
        blurInputOnSelect
      />
      { props.value !== undefined && <label htmlFor={id} className={styles.selectlabel}>{ label }</label> }
    </div>
  );
};

Select.propTypes = {
  clearable: PropTypes.bool,
  id: PropTypes.string,
  label: PropTypes.node.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })).isRequired,
  searchable: PropTypes.bool,
};

Select.defaultProps = {
  id: null,
  searchable: false,
  clearable: false,
};

export default Select;
