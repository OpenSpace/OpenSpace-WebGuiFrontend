import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { startConnection } from '../api/Actions';
import {
  formatVersion, isCompatible, RequiredOpenSpaceVersion, RequiredSocketApiVersion
} from '../api/Version';
import ActionsPanel from '../components/BottomBar/ActionsPanel';

import ErrorMessage from './ErrorMessage';

import '../styles/base.scss';
import styles from './ActionsGui.scss';

function ActionsGui() {
  const [checkedVersion, setCheckedVersion] = React.useState(false);

  const version = useSelector((state) => state.version);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(startConnection());
  }, []);

  if (!checkedVersion && version.isInitialized) {
    const versionData = version.data;
    if (!isCompatible(versionData.openSpaceVersion, RequiredOpenSpaceVersion)) {
      console.warn(
        `Possible incompatibility: \nRequired OpenSpace version: ${
          formatVersion(RequiredOpenSpaceVersion)
        }. Currently controlling OpenSpace version ${
          formatVersion(versionData.openSpaceVersion)}.`
      );
    }
    if (!isCompatible(versionData.socketApiVersion, RequiredSocketApiVersion)) {
      console.warn(
        `Possible incompatibility: \nRequired Socket API version: ${
          formatVersion(RequiredSocketApiVersion)
        }. Currently operating over API version ${
          formatVersion(versionData.socketApiVersion)}.`
      );
    }
    setCheckedVersion(true);
  }

  return (
    <div className={styles.app}>
      <ErrorMessage />
      <ActionsPanel singlewindow />
    </div>
  );
}

export default ActionsGui;
