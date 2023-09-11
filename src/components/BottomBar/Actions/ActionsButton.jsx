import React from 'react';
import { MdLaunch } from 'react-icons/md';
import PropTypes from 'prop-types';

import api from '../../../api/api';
import InfoBox from '../../common/InfoBox/InfoBox';
import Button from '../../common/Input/Button/Button';

import styles from './ActionsButton.scss';

export default function ActionsButton({ action, className }) {
  if (!action) {
    return null;
  }

  const isLocal = (action.synchronization === false);

  function sendAction(e) {
    const actionId = e.currentTarget.getAttribute('actionid');

    const script = `openspace.action.triggerAction('${actionId}')`;
    const shouldSyncScript = !isLocal;
    api.executeLuaScript(script, false, shouldSyncScript);
  }

  return (
    <Button
      block
      smalltext
      onClick={sendAction}
      className={`${className} ${styles.actionButton}`}
      actionid={action.identifier}
    >
      <p className={styles.iconRow}>
        <MdLaunch className={styles.buttonIcon} />
        {isLocal && <span className={styles.localText}> (Local)</span>}
      </p>
      {action.name}
      {' '}
      {' '}
      {action.documentation && <InfoBox text={action.documentation} />}
    </Button>
  );
}

ActionsButton.propTypes = {
  action: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
    // Does not work for some reason
    // PropTypes.objectOf(PropTypes.shape({
    //   documentation: PropTypes.string,
    //   identifier: PropTypes.string,
    //   name: PropTypes.string,
    //   synchronization: PropTypes.bool
    // }))
  ]),
  className: PropTypes.string
};

ActionsButton.defaultProps = {
  action: undefined,
  className: ''
};
