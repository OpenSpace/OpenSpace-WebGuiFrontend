import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setShowAbout, startConnection } from '../api/Actions';
import environment from '../api/Environment';
import {
  formatVersion, isCompatible, RequiredOpenSpaceVersion, RequiredSocketApiVersion
} from '../api/Version';
import BottomBar from '../components/BottomBar/BottomBar';
import Button from '../components/common/Input/Button/Button';
import Overlay from '../components/common/Overlay/Overlay';
import Stack from '../components/common/Stack/Stack';
import { RefsProvider } from '../components/GettingStartedTour/GettingStartedContext';
import NodeMetaContainer from '../components/NodeMetaPanel/NodeMetaContainer';
import NodePopOverContainer from '../components/NodePropertiesPanel/NodePopOverContainer';
import Sidebar from '../components/Sidebar/Sidebar';

import About from './About/About';
import ErrorMessage from './ErrorMessage';

import '../styles/base.scss';
import styles from './RemoteGui.scss';

function RemoteGui() {
  let hasCheckedVersion = false;

  const version = useSelector((state) => state.version);
  const showAbout = useSelector((state) => state.local.showAbout);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(startConnection());
  }, []);

  function hideAbout() {
    dispatch(setShowAbout(false));
  }

  if (!hasCheckedVersion && version.isInitialized) {
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
    hasCheckedVersion = true;
  }

  return (
    <div className={styles.app} style={environment.developmentMode ? { borderStyle: 'solid', borderWidth: '3px', borderColor: 'orange' } : null}>
      {environment.developmentMode && (
        <div className={styles.devModeTextBox}>
          <p>Dev Gui</p>
        </div>
      )}
      <RefsProvider>
        { showAbout && (
          <Overlay>
            <Stack style={{ maxWidth: '500px' }}>
              <Button style={{ alignSelf: 'flex-end', color: 'white' }} onClick={hideAbout}>
                Close
              </Button>
              <About />
            </Stack>
          </Overlay>
        )}
        <ErrorMessage />
        <section className={styles.Grid__Left}>
          <Sidebar />
        </section>
        <section className={styles.Grid__Right}>
          <NodePopOverContainer />
          <NodeMetaContainer />
          <BottomBar showFlightController />
        </section>
      </RefsProvider>
    </div>
  );
}

export default RemoteGui;
