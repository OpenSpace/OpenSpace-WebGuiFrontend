import React, { useState, useEffect, useCallback } from 'react';
import styles from './Drawer.scss';
import Button from '../common/Button/Button';
import { IoClose } from 'react-icons/io5';

export interface DrawerProps {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title?: string;
  body: React.ReactNode;
  footer?: React.ReactNode;
  actionLabel: string;
  disabled?: boolean;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  body,
  footer,
  actionLabel,
  disabled,
  secondaryAction,
  secondaryActionLabel
}) => {
  const [showDrawer, setShowDrawer] = React.useState(isOpen);

  React.useEffect(() => {
    setShowDrawer(isOpen);
  }, [isOpen]);

  const handleCloseDrawer = React.useCallback(() => {
    if (disabled) return;

    setShowDrawer(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [disabled, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <div
          className={styles.content}
          style={showDrawer ? { transform: 'translateY(16px)', opacity: 1 } : { opacity: 0 }}
        >
          <div className={styles.temp}>
            {/* <div className={styles.handle} /> */}
            <div className={styles.header}>
              <h1 className={styles.title}>{title}</h1>
              <button type='button' className={styles.btn} onClick={handleCloseDrawer}>
                <IoClose size={28} />
              </button>
            </div>
            <div className={styles.body}>{body}</div>
            {footer && (
              <div className={styles.footer}>
                <div className={styles.innerFooter}></div>
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
