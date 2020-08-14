import React, { Component } from 'react';
import { withRouter, HashRouter as Router, Route, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import '../styles/base.scss';
import styles from './RemoteGui.scss';
import Sidebar from '../components/Sidebar/Sidebar';
import BottomBar from '../components/BottomBar/BottomBar';
import Button from '../components/common/Input/Button/Button';
import Error from '../components/common/Error/Error';
import Overlay from '../components/common/Overlay/Overlay';
import About from './About/About';
import Stack from '../components/common/Stack/Stack';
import NodePopOverContainer from '../components/NodePropertiesPanel/NodePopOverContainer';
import { startConnection, setShowAbout } from '../api/Actions';
import { isCompatible,
         formatVersion,
         RequiredSocketApiVersion,
         RequiredOpenSpaceVersion } from '../api/Version';

class RemoteGui extends Component {
  constructor(props) {
    super(props);
    this.checkedVersion = false;
  }

  componentDidMount() {
    this.props.startConnection();
  }

  checkVersion() {
    if (!this.checkedVersion && this.props.version.isInitialized) {
      const versionData = this.props.version.data;
      if (!isCompatible(
        versionData.openSpaceVersion, RequiredOpenSpaceVersion))
      {
        console.warn(
          'Possible incompatibility: \nRequired OpenSpace version: ' +
          formatVersion(RequiredOpenSpaceVersion) +
          '. Currently controlling OpenSpace version ' +
          formatVersion(versionData.openSpaceVersion) + '.'
        );
      }
      if (!isCompatible(
        versionData.socketApiVersion, RequiredSocketApiVersion))
      {
        console.warn(
          "Possible incompatibility: \nRequired Socket API version: " +
          formatVersion(RequiredSocketApiVersion) +
          ". Currently operating over API version " +
          formatVersion(versionData.socketApiVersion) + '.'
        );
      }
      this.checkedVersion = true;
    }
  }

  reloadGui() {
    location.reload();
  }

  render() {
    this.checkVersion();
    return (
      <div className={styles.app}>
        { this.props.showAbout && (
          <Overlay>
            <Stack style={{ maxWidth: '500px' }}>
              <Button style={{ alignSelf: 'flex-end', color: 'white' }} onClick={this.props.hideAbout}>
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
        <section className={styles.Grid__Left}>
          <Sidebar />
        </section>
        <section className={styles.Grid__Right}>
          <NodePopOverContainer />
          <BottomBar showFlightController="true"/>
        </section>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  connectionLost: state.connection.connectionLost,
  version: state.version,
  showAbout: state.local.showAbout
});

const mapDispatchToProps = dispatch => ({
  startConnection: () => {
    dispatch(startConnection());
  },
  hideAbout: () => {
    dispatch(setShowAbout(false))
  }
});

RemoteGui = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(RemoteGui));

export default RemoteGui;
