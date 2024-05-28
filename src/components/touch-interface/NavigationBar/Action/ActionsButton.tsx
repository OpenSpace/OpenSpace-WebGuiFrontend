import React from 'react';
import { MdLaunch } from 'react-icons/md';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import InfoBox from '../../../common/InfoBox/InfoBox';
import Button from '../../../common/Input/Button/Button';

import styles from './ActionsButton.scss';

interface Action {
  documentation?: string;
  identifier: string;
  name: string;
  synchronization: boolean;
}

interface ActionsButtonProps {
  action?: Action | string;
  className?: string;
}

const ActionsButton: React.FC<ActionsButtonProps> = ({ action, className }) => {
  if (!action) {
    return null;
  }

  const luaApi = useSelector((state: any) => state.luaApi);

  function sendAction(e: React.MouseEvent<HTMLDivElement>) {
    const actionId = e.currentTarget.getAttribute('actionid');
    if (actionId) {
      luaApi.action.triggerAction(actionId);
    }
  }

  const isLocal = typeof action === 'object' ? action.synchronization === false : false;

  return (
    <Button
      block
      smalltext
      onClick={sendAction}
      className={`${className} ${styles.actionButton}`}
      actionid={typeof action === 'string' ? action : action.identifier}
    >
      <p className={styles.iconRow}>
        <MdLaunch className={styles.buttonIcon} />
        {isLocal && <span className={styles.localText}> (Local)</span>}
      </p>
      {typeof action === 'string' ? action : action.name}{' '}
      {typeof action === 'object' && action.documentation && (
        <InfoBox text={action.documentation} />
      )}
    </Button>
  );
};

export default ActionsButton;
