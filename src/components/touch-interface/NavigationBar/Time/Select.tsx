import React from 'react';
import ReactSelect, { StylesConfig, Props } from 'react-select';
import { excludeKeys } from '../../../../utils/helpers';
import Input from '../../common/Input/Input';
import styles from './Select.scss';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<Props<Option, false>, 'options' | 'onChange' | 'value'> {
  value?: Option | null;
  label: React.ReactNode;
  id?: string;
  disabled?: boolean;
  options: Option[];
  onChange?: (option: Option | null) => void;
  clearable?: boolean;
  searchable?: boolean;
}

const selectStyles: StylesConfig<Option, false> = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#30303a70',
    borderWidth: 0,
    boxShadow: 'none',
    height: 41
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#30303a',
    margin: 0,
    zIndex: 10
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#D9DA6D'
  }),
  indicatorSeparator: () => ({}),
  dropdownIndicator: (provided) => ({
    ...provided,
    ':hover': {
      color: '#fff'
    },
    color: '#999',
    paddingRight: 8
  }),
  option: (provided, state) => ({
    ...provided,
    color: '#FFF',
    backgroundColor: state.isFocused ? '#43434370' : '#30303a'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'inherited',
    marginLeft: 0
  }),
  input: (provided) => ({
    ...provided,
    color: 'transparent'
  })
};

const Select: React.FC<SelectProps & { generateUniqueId?: () => string }> = ({
  value,
  label,
  id,
  disabled,
  options,
  onChange,
  clearable = false,
  searchable = false,
  generateUniqueId,
  ...props
}) => {
  const identifier = id || `select-${generateUniqueId?.()}`;

  const handleChange = (option: Option | null) => {
    if (onChange) {
      onChange(option);
    }
  };

  return (
    <div className={styles.selectgroup}>
      <ReactSelect
        id={identifier}
        isDisabled={disabled}
        placeholder={label}
        styles={selectStyles}
        options={options}
        onChange={handleChange}
        value={options.find((opt) => `${opt.value}` === `${value}`)}
        blurInputOnSelect
        isClearable={clearable}
        isSearchable={searchable}
        {...props}
      />
      {value !== undefined && (
        <label htmlFor={id} className={styles.selectlabel}>
          {label}
        </label>
      )}
    </div>
  );
};

export default Select;
