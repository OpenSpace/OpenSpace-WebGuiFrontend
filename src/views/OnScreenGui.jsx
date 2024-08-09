import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { setShowAbout, startConnection } from '../api/Actions';
import environment from '../api/Environment';
import {
  formatVersion, isCompatible, RequiredOpenSpaceVersion, RequiredSocketApiVersion
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

import About from './About/About';
import ErrorMessage from './ErrorMessage';

import '../styles/base.scss';
import styles from './OnScreenGui.scss';

import NavigationLayer from '../components/NavigationLayer/NavigationLayer';

function OnScreenGui({
  isInBrowser
}) {
  let hasCheckedVersion = false;

  this.showFlightController = props.showFlightController;

  const [showTutorial, setShowTutorial] = React.useState(false);
  const [luaConsoleVisible, setLuaConsoleVisible] = React.useState(false);

  const version = useSelector((state) => state.version);
  const showAbout = useSelector((state) => state.local.showAbout);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(startConnection());

    function toggleConsole(e) {
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
        `Possible incompatibility: \nRequired OpenSpace version: ${
          formatVersion(RequiredOpenSpaceVersion)
        }. Currently controlling OpenSpace version ${
          formatVersion(versionData.openSpaceVersion)}.`,
      );
    }
    if (!isCompatible(versionData.socketApiVersion, RequiredSocketApiVersion)) {
      console.warn(
        `Possible incompatibility: \nRequired Socket API version: ${
          formatVersion(RequiredSocketApiVersion)
        }. Currently operating over API version ${
          formatVersion(versionData.socketApiVersion)}.`,
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
        { this.props.connectionLost && (
          <Overlay>
            <Error>
              <h2>Houston, we've had a...</h2>
              <p>...disconnection between the user interface and OpenSpace.</p>
              <p>Trying to reconnect automatically, but you may want to...</p>
              <Button className={Error.styles.errorButton} onClick={this.reloadGui}>Reload the user interface</Button>
            </Error>
          </Overlay>
        )}

        <NavigationLayer/>
        <section className={styles.Grid__Left}>
          <Sidebar showTutorial={setShowTutorial} />
        </section>
        <section className={styles.Grid__Right}>
          {isInBrowser && luaConsoleVisible && <LuaConsole />}
          <NodePopOverContainer />
          <NodeMetaContainer />
          <BottomBar />
          <KeybindingPanel />
          <TourPopup isVisible={showTutorial} setVisibility={(show) => setShowTutorial(show)} />
        </section>
      </RefsProvider>
    </div>
  );
}

OnScreenGui.propTypes = {
  isInBrowser: PropTypes.bool
};

OnScreenGui.defaultProps = {
  isInBrowser: false
};

export default OnScreenGui;
