import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { setShowAbout, startConnection } from '../api/Actions';
import { formatVersion, isCompatible, RequiredOpenSpaceVersion, RequiredSocketApiVersion } from '../api/Version';
import BottomBar from '../components/BottomBar/BottomBar';
import KeybindingPanel from '../components/BottomBar/KeybindingPanel';
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

class OnScreenGui extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTutorial : false,
      luaConsoleVisible : false
    }
    this.checkedVersion = false;
    this.showFlightController = props.isInBrowser;
    this.toggleConsole = this.toggleConsole.bind(this);
  }

  componentDidMount() {
    this.props.startConnection();
    window.addEventListener("keydown", this.toggleConsole);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.toggleConsole);
  }

  toggleConsole(e) {
      if(e.code === "Backquote") {
        this.setState({
          luaConsoleVisible : !this.state.luaConsoleVisible
        });
      }
  }

  checkVersion() {
    if (!this.checkedVersion && this.props.version.isInitialized) {
      const versionData = this.props.version.data;
      if (!isCompatible(versionData.openSpaceVersion, RequiredOpenSpaceVersion)) {
        console.warn(
          'Possible incompatibility: \nRequired OpenSpace version: ' +
          formatVersion(RequiredOpenSpaceVersion) +
          '. Currently controlling OpenSpace version ' +
          formatVersion(versionData.openSpaceVersion) + '.'
        );
      }
      if (!isCompatible(versionData.socketApiVersion, RequiredSocketApiVersion)) {
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
    const {isInBrowser} = this.props;
    this.checkVersion();
    return (
      <div className={styles.app}>
        <TutorialProvider>
          {this.props.showAbout && (
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
          <Sidebar showTutorial={ (show) => this.setState({ showTutorial : show })}/>
        </section>
        <section className={styles.Grid__Right}>
          {isInBrowser && this.state.luaConsoleVisible && <LuaConsole />}
          <NodePopOverContainer />
          <NodeMetaContainer />
          <BottomBar showFlightController={this.showFlightController}/>
          <KeybindingPanel />
          <TourPopup isVisible={this.state.showTutorial} setVisibility = { (show) => this.setState({ showTutorial : show })}/>
        </section>
      </TutorialProvider>
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

OnScreenGui = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(OnScreenGui));

export default OnScreenGui;
