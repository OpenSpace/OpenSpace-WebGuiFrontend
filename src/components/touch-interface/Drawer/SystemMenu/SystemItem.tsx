import React from 'react';
import styles from './SystemDrawer.scss';
import { Dispatch } from 'redux';

// ? Is this correct typing for this click event?
export interface SystemItemProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactElement;
  disabled?: boolean;
  shortcut?: string;
}

const SystemItem: React.FC<SystemItemProps> = ({ label, onClick, icon, disabled, shortcut }) => {
  const handleOnClick = () => {
    if (disabled) return;
    onClick();
  };

  return (
    <div className={styles.item}>
      <div className={`${styles.itemLabel} ${disabled && styles.disabled}`} onClick={handleOnClick}>
        <div>{label}</div>
        <span>{shortcut}</span>
      </div>
    </div>
  );
};

export default SystemItem;
