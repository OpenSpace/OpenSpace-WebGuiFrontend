import React from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { startConnection } from '../api/Actions';
import {
  formatVersion, isCompatible, RequiredOpenSpaceVersion, RequiredSocketApiVersion
} from '../api/Version';
import ActionsPanel from '../components/BottomBar/ActionsPanel';
import '../styles/base.scss';
import styles from './ActionsGui.scss';
import Overlay from '../components/common/Overlay/Overlay';
import Error from '../components/common/Error/Error';
import Button from '../components/common/Input/Button/Button';

function ActionsGui({ dispatchStartConnection, version, connectionLost }) {
  const [checkedVersion, setCheckedVersion] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    dispatchStartConnection();
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

  function reloadGui() {
    location.reload();
  }

  return (
    <div className={styles.app}>
      { connectionLost && (
        <Overlay>
          <Error>
            <h2>Houston, we've had a...</h2>
            <p>...disconnection between the user interface and OpenSpace.</p>
            <p>Trying to reconnect automatically, but you may want to...</p>
            <Button className={Error.styles.errorButton} onClick={reloadGui}>
              Reload the user interface
            </Button>
          </Error>
        </Overlay>
      )}
      <ActionsPanel singlewindow />
    </div>
  );
}

const mapStateToProps = (state) => ({
  connectionLost: state.connection.connectionLost,
  version: state.version
});

const mapDispatchToProps = (dispatch) => ({
  dispatchStartConnection: () => {
    dispatch(startConnection());
  }
});

ActionsGui = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActionsGui);

export default ActionsGui;
