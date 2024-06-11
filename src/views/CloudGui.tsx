import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setShowAbout, startConnection } from '../api/Actions';
import environment from '../api/Environment';
import {
  formatVersion,
  isCompatible,
  RequiredOpenSpaceVersion,
  RequiredSocketApiVersion
} from '../api/Version';
import BottomBar from '../components/BottomBar/BottomBar';
import KeybindingPanel from '../components/BottomBar/KeybindingPanel';
import Button from '../components/common/Input/Button/Button';
import Overlay from '../components/common/Overlay/Overlay';
import Stack from '../components/common/Stack/Stack';
import { RefsProvider } from '../components/GettingStartedTour/GettingStartedContext';
import TourPopup from '../components/GettingStartedTour/TourPopup';
import LuaConsole from '../components/LuaConsole/LuaConsole';
import NodeMetaContainer from '../components/NodeMetaPanel/NodeMetaContainer';
import NodePopOverContainer from '../components/NodePropertiesPanel/NodePopOverContainer';
import Sidebar from '../components/Sidebar/Sidebar';
import TouchWrapper from '../components/touch-interface/TouchWrapper/TouchWrapper';

import About from './About/About';
import ErrorMessage from './ErrorMessage';

import '../styles/base.scss';
import styles from './CloudGui.scss';
import NavigationBar from '../components/touch-interface/NavigationBar/NavigationBar';
import { SystemDrawer } from '../components/touch-interface/Drawer/SystemMenu/SystemDrawer';
import { NavigationDrawer } from '../components/touch-interface/Drawer/NavigationMenu/NavigationDrawer';
import { ActionDrawer } from '../components/touch-interface/Drawer/ActionMenu/ActionDrawer';
import { TimeDrawer } from '../components/touch-interface/Drawer/TimeMenu/TimeDrawer';
import { SceneDrawer } from '../components/touch-interface/Drawer/SceneDrawer/SceneDrawer';
import Time from 'src/components/common/Input/Time/Time';
// import{ NavigationDrawer} from '../components/touch-interface/Drawer/NavigationMenu/NavigationDrawer';
import StatusBar from '../components/touch-interface/TouchWrapper/StatusBar';
import FrictionBar from '../components/touch-interface/FrictionBar/FrictionBar';

interface CloudGuiProps {
  isInBrowser: boolean;
  showFlightController: boolean;
}

function CloudGui({ isInBrowser = false }: CloudGuiProps) {
  let hasCheckedVersion = false;
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [luaConsoleVisible, setLuaConsoleVisible] = React.useState(false);

  // Change any to correct typing
  const version = useSelector((state: any) => state.version);
  const showAbout = useSelector((state: any) => state.local.showAbout);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(startConnection());

    function toggleConsole(e: KeyboardEvent) {
      // Change typing from any to correct type
      if (e.code === 'Backquote') {
        setLuaConsoleVisible((current) => !current);
      }
    }

    window.addEventListener('keydown', toggleConsole);
    return () => window.removeEventListener('keydown', toggleConsole);
  }, []);

  function hideAbout() {
    dispatch(setShowAbout(false));
  }

  // Check the version
  if (!hasCheckedVersion && version.isInitialized) {
    const versionData = version.data;
    if (!isCompatible(versionData.openSpaceVersion, RequiredOpenSpaceVersion)) {
      console.warn(
        `Possible incompatibility: \nRequired OpenSpace version: ${formatVersion(
          RequiredOpenSpaceVersion
        )}. Currently controlling OpenSpace version ${formatVersion(versionData.openSpaceVersion)}.`
      );
    }
    if (!isCompatible(versionData.socketApiVersion, RequiredSocketApiVersion)) {
      console.warn(
        `Possible incompatibility: \nRequired Socket API version: ${formatVersion(
          RequiredSocketApiVersion
        )}. Currently operating over API version ${formatVersion(versionData.socketApiVersion)}.`
      );
    }
    hasCheckedVersion = true;
  }

  return (
    <div
      className={styles.app}
      style={
        environment.developmentMode && {
          borderStyle: 'solid',
          borderWidth: '3px',
          borderColor: 'orange'
        }
      }
    >
      {environment.developmentMode && (
        <div className={styles.devModeTextBox}>
          <p>Dev Gui</p>
        </div>
      )}
      <RefsProvider>
        <TouchWrapper>
          {showAbout && (
            <Overlay>
              <Stack style={{ maxWidth: '500px' }} className={''}>
                <div style={{ alignSelf: 'flex-end', color: 'white' }} onClick={hideAbout}>
                  Close
                </div>
                <About />
              </Stack>
            </Overlay>
          )}
          {/* <ErrorMessage /> */}
          <main>
            <StatusBar />
            <FrictionBar />
            {isInBrowser && luaConsoleVisible && <LuaConsole />}
            <NodePopOverContainer />
            <NodeMetaContainer />
            <NavigationBar showTutorial={showTutorial} />

            <KeybindingPanel />
            <TourPopup isVisible={showTutorial} setVisibility={(show) => setShowTutorial(show)} />
          </main>
        </TouchWrapper>
        <SceneDrawer />
        <SystemDrawer />
        <ActionDrawer />
        <NavigationDrawer />
        <TimeDrawer />
      </RefsProvider>
    </div>
  );
}

export default CloudGui;
