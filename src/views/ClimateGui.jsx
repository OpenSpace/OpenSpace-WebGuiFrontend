
import React, { Component } from 'react';
import {
  withRouter, HashRouter as Router, Route, Link,
} from 'react-router-dom';
import { connect } from 'react-redux';
import Error from '../components/common/Error/Error';
import Overlay from '../components/common/Overlay/Overlay';
import Stack from '../components/common/Stack/Stack';
import BottomBar from '../components/BottomBar/BottomBar';
import Climate from '../components/Climate/Climate';
import {
  setPropertyValue, startConnection, fetchData, addStoryTree, subscribeToProperty,
  unsubscribeToProperty, addStoryInfo, resetStoryInfo,
} from '../api/Actions';
import '../styles/base.scss';
import Sidebar from '../components/Sidebar/Sidebar';
import styles from './ClimateGui.scss';
import NodeMetaContainer from '../components/NodeMetaPanel/NodeMetaContainer';
import NodePopOverContainer from '../components/NodePropertiesPanel/NodePopOverContainer';
import KeybindingPanel from '../components/BottomBar/KeybindingPanel';

//I guess we need these, but maybe other parameters
import { UpdateDeltaTimeNow } from '../utils/timeHelpers';
import {
  toggleShading, toggleHighResolution, toggleShowNode, toggleGalaxies,
  setStoryStart, showDevInfoOnScreen, storyFileParser, infoFileParser, flyTo,
} from '../utils/storyHelpers';

import About from './About/About';
import ClimatePanel from '../components/BottomBar/ClimatePanel';
import { formatVersion, isCompatible, RequiredOpenSpaceVersion, RequiredSocketApiVersion } from '../api/Version';
//change later
import DeveloperMenu from '../components/TouchBar/UtilitiesMenu/presentational/DeveloperMenu';


class ClimateGui extends Component {
  constructor(props) {
    super(props);this.checkedVersion = false;
    this.state = {
      developerMode: false,

    };

    this.toggleDeveloperMode = this.toggleDeveloperMode.bind(this);
  }

  componentDidMount() {
    this.props.startConnection();
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
  handleKeyPress(e) {
    if (e.keyCode === KEYCODE_D) {
      this.toggleDeveloperMode();
    }
  }

  toggleDeveloperMode() {
    const { developerMode } = this.state;
    const { luaApi } = this.props;
    this.setState({ developerMode: !developerMode });

    showDevInfoOnScreen(luaApi, developerMode);
  }

  render() {
    this.checkVersion();
    const { story } = this.props;
    const { developerMode } = this.state;
    return (

      <div className={styles.app}>
      //unclear if we should use the line below
        { this.props.showAbout && (
          //or this owners
          // render={() => (
          <Overlay>
            <Stack style={{ maxWidth: '500px' }}>

              // OR
               <Link style={{ alignSelf: 'flex-end', color: 'white' }} to="/">
                Close
              </Link>
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
        </Error>
      </Overlay>
    )}

    { developerMode && (
      <DeveloperMenu
        changeStory={this.changeStory}
        storyIdentifier={storyIdentifier}
      />
    )}
    <p className={styles.storyTitle}>
      {story.title}
    </p>
    /*{(currentStory === DefaultStory)
      ? <Slider startSlider={sliderStartStory} changeStory={this.setStory} />
      : <TouchBar resetStory={this.resetStory} />
    }*/

    /*

    <section className={styles.Grid__Left}>
      <Sidebar />
    </section>
    <section className={styles.Grid__Right}>
      <NodePopOverContainer />
      <NodeMetaContainer />
      <BottomBar showFlightController={this.props.showFlightController}/>
      <KeybindingPanel />

    </section>*/
      </div>
    );
  }
}


const mapStateToProps = state => ({
  connectionLost: state.connection.connectionLost,
  version: state.version,

});

const mapDispatchToProps = dispatch => ({
  startConnection: () => {
    dispatch(startConnection());
  },
});

ClimateGui = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClimateGui));

export default ClimateGui;
