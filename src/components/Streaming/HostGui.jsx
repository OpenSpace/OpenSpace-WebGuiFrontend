import React, { useEffect } from 'react';
import { setShowAbout, startConnection } from '../../api/Actions';
import { useSelector, useDispatch } from 'react-redux';
//import { formatVersion, isCompatible, RequiredOpenSpaceVersion, RequiredSocketApiVersion } from '../api/Version';
import StreamingBottomBar from './StreamingBottomBar';
import Error from '../common/Error/Error';
import Button from '../common/Input/Button/Button';
import Overlay from '../common/Overlay/Overlay';
import Stack from '../common/Stack/Stack';
import NavigationLayer from './NavigationLayer';
import NodeMetaContainer from '../NodeMetaPanel/NodeMetaContainer';
import NodePopOverContainer from '../NodePropertiesPanel/NodePopOverContainer';
import Sidebar from '../Sidebar/Sidebar';
import StreamedVideo from './StreamedVideo';
import About from '../../views/About/About';
import './../../styles/base.scss';
import styles from './StreamingGui.scss';
import { RefsProvider } from '../GettingStartedTour/GettingStartedContext';

function HostGui({}) {
  const connectionLost = useSelector((state) => state.connection.connectionLost);
  const showAbout = useSelector((state) => state.local.showAbout);

  const dispatch = useDispatch();

  useEffect(() =>  {
    dispatch(startConnection());
  }, []);

  function reloadGui() {
    location.reload();
  }

  return (
    <RefsProvider>
      <div className={styles.app}>
        {/* If we have a active session, we want to have the navpad...*/}
        { showAbout && (
          <Overlay>
            <Stack style={{ maxWidth: '500px' }}>
              <Button style={{ alignSelf: 'flex-end', color: 'white' }} onClick={() => dispatch(setShowAbout(false))}>
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
        {/* Standard appearance*/}
        <StreamedVideo/>
        <NavigationLayer/>
        <section className={styles.Grid__Left}>
            <Sidebar/>
        </section>
        <section className={styles.Grid__Right}>
          <NodePopOverContainer />
          <NodeMetaContainer />
          <StreamingBottomBar className={styles.botBar} showFlightSettings={true}/>
        </section>
      </div>
    </RefsProvider>
  );
}

export default HostGui;