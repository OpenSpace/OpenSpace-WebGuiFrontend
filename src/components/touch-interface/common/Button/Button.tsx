import React from 'react';
import { IconType } from 'react-icons';
import styles from './Button.scss';

interface ButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  icon?: IconType;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled,
  outline,
  small,
  icon: Icon
}) => {
  return (
    <button
      className={`${outline && styles.outline} ${small ? styles.small : styles.btnDefault}`}
      type='button'
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={24} className={styles.icon} />}
      {label}
    </button>
  );
};

export default Button;
