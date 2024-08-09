import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { startConnection } from '../api/Actions';
import ActionsPanel from '../components/BottomBar/ActionsPanel';

import ErrorMessage from './ErrorMessage';

import '../styles/base.scss';
import styles from './ActionsGui.scss';

function ActionsGui() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(startConnection());
  }, []);

  return (
    <div className={styles.app}>
      <ErrorMessage />
      <ActionsPanel singlewindow />
    </div>
  );
}

export default ActionsGui;
