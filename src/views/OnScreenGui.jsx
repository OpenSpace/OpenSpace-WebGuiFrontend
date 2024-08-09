import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { setShowAbout, startConnection } from '../api/Actions';
import environment from '../api/Environment';
import BottomBar from '../components/BottomBar/BottomBar';
import KeybindingPanel from '../components/BottomBar/KeybindingPanel';
import UserControlPanelContainer from '../components/BottomBar/UserControlPanel/UserControlPanelContainer';
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

function OnScreenGui({
  isInBrowser,
  showFlightController
}) {
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [luaConsoleVisible, setLuaConsoleVisible] = React.useState(false);

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
          <Sidebar showTutorial={isInBrowser ? null : setShowTutorial} />
        </section>
        <section className={styles.Grid__Right}>
          {isInBrowser && luaConsoleVisible && <LuaConsole />}
          <NodePopOverContainer />
          <NodeMetaContainer />
          <UserControlPanelContainer />
          <BottomBar showFlightController={showFlightController} />
          <KeybindingPanel />
          <TourPopup isVisible={showTutorial} setVisibility={(show) => setShowTutorial(show)} />
        </section>
      </RefsProvider>
    </div>
  );
}

OnScreenGui.propTypes = {
  isInBrowser: PropTypes.bool,
  showFlightController: PropTypes.bool
};

OnScreenGui.defaultProps = {
  isInBrowser: false,
  showFlightController: false
};

export default OnScreenGui;
