import React from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setShowAbout, startConnection } from '../api/Actions';
import {
  formatVersion, isCompatible, RequiredOpenSpaceVersion, RequiredSocketApiVersion,
} from '../api/Version';
import BottomBar from '../components/BottomBar/BottomBar';
import KeybindingPanel from '../components/BottomBar/KeybindingPanel';
import environment from '../api/Environment'
import Error from '../components/common/Error/Error';
import Button from '../components/common/Input/Button/Button';
import Overlay from '../components/common/Overlay/Overlay';
import Stack from '../components/common/Stack/Stack';
import LuaConsole from '../components/LuaConsole/LuaConsole';
import NodeMetaContainer from '../components/NodeMetaPanel/NodeMetaContainer';
import NodePopOverContainer from '../components/NodePropertiesPanel/NodePopOverContainer';
import Sidebar from '../components/Sidebar/Sidebar';
import '../styles/base.scss';
import About from './About/About';
import styles from './OnScreenGui.scss';
import TourPopup from '../components/GettingStartedTour/TourPopup'
import { TutorialProvider } from '../components/GettingStartedTour/GettingStartedContext';

function OnScreenGui({
  showFlightController, connectionLost, startConnection, version, showAbout, hideAbout, isInBrowser
}) {
  let hasCheckedVersion = false;
  const location = useLocation();
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [luaConsoleVisible, setLuaConsoleVisible] = React.useState(false);

  React.useEffect(() => {
    startConnection();
    window.addEventListener("keydown", toggleConsole);
    return () => window.removeEventListener('keydown', toggleConsole);
  }, []);

 
  function toggleConsole(e) {
      if(e.code === "Backquote") {
        setLuaConsoleVisible(!luaConsoleVisible);
      }
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

  function reloadGui() {
    location.reload();
  }

  return (
    <div className={styles.app} style={environment.developmentMode ? { borderStyle: 'solid', borderWidth: '3px', borderColor: 'orange' } : null}>
      {environment.developmentMode &&
        <div className={styles.devModeTextBox}>
          <p>Dev Gui</p>
        </div>
      }
      <TutorialProvider>
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
        { connectionLost && (
          <Overlay>
            <Error>
              <h2>Houston, we've had a...</h2>
              <p>...disconnection between the user interface and OpenSpace.</p>
              <p>Trying to reconnect automatically, but you may want to...</p>
              <Button className={Error.styles.errorButton} onClick={reloadGui}>Reload the user interface</Button>
            </Error>
          </Overlay>
        )}
        <section className={styles.Grid__Left}>
          <Sidebar showTutorial={ setShowTutorial } />
        </section>
        <section className={styles.Grid__Right}>
          {isInBrowser && luaConsoleVisible && <LuaConsole />}
          <NodePopOverContainer />
          <NodeMetaContainer />
          <BottomBar showFlightController={showFlightController} />
          <KeybindingPanel />
          <TourPopup isVisible={showTutorial} setVisibility = { (show) => setShowTutorial(show)}/>
        </section>
      </TutorialProvider>
    </div>
  );  
}

const mapStateToProps = (state) => ({
  connectionLost: state.connection.connectionLost,
  version: state.version,
  showAbout: state.local.showAbout,
});

const mapDispatchToProps = (dispatch) => ({
  startConnection: () => {
    dispatch(startConnection());
  },
  hideAbout: () => {
    dispatch(setShowAbout(false));
  },
});

OnScreenGui = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OnScreenGui);

export default OnScreenGui;
