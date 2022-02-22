import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  withRouter, HashRouter as Router, Route, Link,
} from 'react-router-dom';
import { connect } from 'react-redux';
import '../styles/base.scss';
import Error from '../components/common/Error/Error';
import Overlay from '../components/common/Overlay/Overlay';
import Stack from '../components/common/Stack/Stack';
import {
  setPropertyValue, startConnection, fetchData, addStoryTree, subscribeToProperty,
  unsubscribeToProperty, addStoryInfo, resetStoryInfo,
} from '../api/Actions';
import TouchBar from '../components/TouchBar/TouchBar';
import DeveloperMenu from '../components/TouchBar/UtilitiesMenu/presentational/DeveloperMenu';
import {
  InfoIconKey, ValuePlaceholder, DefaultStory, ScaleKey,
  NavigationAnchorKey, ZoomInLimitKey, ZoomOutLimitKey,
} from '../api/keys';
import Slider from '../components/ImageSlider/Slider';
import { UpdateDeltaTimeNow } from '../utils/timeHelpers';
import styles from './OnTouchGui.scss';
import {
  toggleShading, toggleHighResolution, toggleShowNode, toggleGalaxies,
  setStoryStart, showDevInfoOnScreen, storyFileParser, infoFileParser, flyTo,
} from '../utils/storyHelpers';
import {
  isCompatible, formatVersion, RequiredSocketApiVersion, RequiredOpenSpaceVersion,
} from '../api/Version';

const KEYCODE_D = 68;

class OnTouchGui extends Component {
  constructor(props) {
    super(props);
    this.checkedVersion = false;
    this.state = {
      developerMode: false,
      currentStory: DefaultStory,
      sliderStartStory: DefaultStory,
    };

    this.addStoryTree = this.addStoryTree.bind(this);
    this.changeStory = this.changeStory.bind(this);
    this.setStory = this.setStory.bind(this);
    this.resetStory = this.resetStory.bind(this);
    this.checkStorySettings = this.checkStorySettings.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.toggleDeveloperMode = this.toggleDeveloperMode.bind(this);
  }

  componentDidMount() {
    const { luaApi, FetchData, StartConnection } = this.props;
    StartConnection();
    FetchData(InfoIconKey);

    document.addEventListener('keydown', this.handleKeyPress);
    showDevInfoOnScreen(luaApi, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  setStory(selectedStory) {
    const {
      anchorNode, changePropertyValue, luaApi, scaleNodes, story, storyIdentifier,
    } = this.props;
    const previousStory = storyIdentifier;

    this.setState({ currentStory: selectedStory });

    // Return if the selected story is the same as the OpenSpace property value
    if (previousStory === selectedStory) {
      return;
    }

    const json = this.addStoryTree(selectedStory);

    // Set all the story specific properties
    changePropertyValue(anchorNode.description.Identifier, json.start.planet);
    setStoryStart(luaApi, json.start.location, json.start.date);

    if (json.overviewlimit) {
      changePropertyValue(ZoomOutLimitKey, json.overviewlimit);
    }
    if (json.inzoomlimit) {
      changePropertyValue(ZoomInLimitKey, json.inzoomlimit);
    } else {
      json.inzoomlimit = 1.0;
      changePropertyValue(ZoomInLimitKey, 1.0);
    }
    if (json.start.overviewzoom) {
      flyTo(luaApi, json.overviewlimit, 5.0);
    }

    changePropertyValue(anchorNode.description.Identifier, json.start.planet);

    // Check settings of the previous story and reset values
    this.checkStorySettings(story, true);
    // Check and set the settings of the current story
    this.checkStorySettings(json, false);

    // If the previous story scaled planets reset value
    if (story.scalenodes) {
      scaleNodes.forEach((node) => {
        changePropertyValue(node.description.Identifier, 1);
      });
    }
    // If the previous story toggled bool properties reset them to default value
    if (story.toggleboolproperties) {
      story.toggleboolproperties.forEach((property) => {
        const defaultValue = property.defaultvalue;
        changePropertyValue(property.URI, defaultValue);
      });
    }
  }

  checkVersion() {
    const { version } = this.props;

    if (!this.checkedVersion && version.isInitialized) {
      const versionData = version.data;
      if (!isCompatible(
        versionData.openSpaceVersion, RequiredOpenSpaceVersion
      )) {
        console.warn(
          `Possible incompatibility: \nRequired OpenSpace version: ${
            formatVersion(RequiredOpenSpaceVersion)
          }. Currently controlling OpenSpace version ${
            formatVersion(versionData.openSpaceVersion)
          }.`
        );
      }
      if (!isCompatible(versionData.socketApiVersion, RequiredSocketApiVersion)) {
        console.warn(
          `Possible incompatibility: \nRequired Socket API version: ${
            formatVersion(RequiredSocketApiVersion)
          }. Currently operating over API version ${
            formatVersion(versionData.socketApiVersion)
          }.`
        );
      }
      this.checkedVersion = true;
    }
  }

  resetStory() {
    const { luaApi } = this.props;
    const { currentStory } = this.state;

    this.state.sliderStartStory = currentStory;
    UpdateDeltaTimeNow(luaApi, 1);
    this.setStory(DefaultStory);
  }

  checkStorySettings(story, value) {
    const { luaApi } = this.props;
    
    const oppositeValue = !value;

    if (story.hidenodes) {
      story.hidenodes.forEach(node => toggleShowNode(luaApi, node, value));
    }
    if (story.highresplanets) {
      story.highresplanets.forEach(node => toggleHighResolution(luaApi, node, oppositeValue));
    }
    if (story.noshadingplanets) {
      story.noshadingplanets.forEach(node => toggleShading(luaApi, node, value));
    }
    if (story.galaxies) {
      toggleGalaxies(luaApi, oppositeValue);
    }
  }

  // Read in json-file for new story and add it to redux
  addStoryTree(selectedStory) {
    const { AddStoryTree, AddStoryInfo, ResetStoryInfo } = this.props;
    const storyFile = storyFileParser(selectedStory);

    AddStoryTree(storyFile);
    if (storyFile.infoiconsfile) {
      const info = infoFileParser(storyFile.infoiconsfile);
      AddStoryInfo(info);
    } else {
      ResetStoryInfo();
    }

    return storyFile;
  }

  changeStory(e) {
    this.setStory(e.target.id);
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
    const { connectionLost, story, storyIdentifier } = this.props;
    const { currentStory, developerMode, sliderStartStory } = this.state;

    return (
      <div className={styles.app}>
        {
          <Router basename="/ontouch/">
            <Route
              path="/about"
              render={() => (
                <Overlay>
                  <Stack style={{ maxWidth: '500px' }}>
                    <Link style={{ alignSelf: 'flex-end', color: 'white' }} to="/">
                      Close
                    </Link>
                    <About />
                  </Stack>
                </Overlay>
              )}
            />
          </Router>
        }
        { connectionLost && (
          <Overlay>
            <Error>
              Connection lost. Trying to reconnect again soon.
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
        {(currentStory === DefaultStory)
          ? <Slider startSlider={sliderStartStory} changeStory={this.setStory} />
          : <TouchBar resetStory={this.resetStory} />
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let storyIdentifier = [];
  let anchorNode;
  const scaleNodes = [];
  const story = state.storyTree.story;

  if (state.propertyTree !== undefined) {
    storyIdentifier = story.identifier;
    anchorNode = state.propertyTree.properties[NavigationAnchorKey];

    if (story.scalenodes) {
      story.scalenodes.nodes.forEach((node) => {
        const key = ScaleKey.replace(ValuePlaceholder, `${node}`);
        const foundScaleNode = state.propertyTree.properties[key];

        if (foundScaleNode) {
          scaleNodes.push(foundScaleNode);
        }
      });
    }
  }

  return {
    storyIdentifier,
    connectionLost: state.connection.connectionLost,
    story,
    reset: state.storyTree.reset,
    anchorNode,
    scaleNodes,
    luaApi: state.luaApi,
  };
};

const mapDispatchToProps = dispatch => ({
  changePropertyValue: (uri, value) => {
    dispatch(setPropertyValue(uri, value));
  },
  FetchData: (id) => {
    dispatch(fetchData(id));
  },
  AddStoryTree: (story) => {
    dispatch(addStoryTree(story));
  },
  AddStoryInfo: (info) => {
    dispatch(addStoryInfo(info));
  },
  ResetStoryInfo: () => {
    dispatch(resetStoryInfo());
  },
  startListening: (uri) => {
    dispatch(subscribeToProperty(uri));
  },
  stopListening: (uri) => {
    dispatch(unsubscribeToProperty(uri));
  },
});

OnTouchGui = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(OnTouchGui));

// Because some of the functionality in OnTouch Gui requires the luaApi
// we wrap it up in another component that only renders the gui after
// luaApi has been connected
class RequireLuaApi extends Component {
  componentDidMount() {
    const { StartConnection } = this.props;
    StartConnection();
  }

  render() {
    const { children, luaApi } = this.props;
    if (!luaApi) {
      return null;
    }
    return <>{children}</>;
  }
}

const mapState = state => ({
  luaApi: state.luaApi,
});

const mapDispatch = dispatch => ({
  StartConnection: () => {
    dispatch(startConnection());
  },
});

RequireLuaApi = connect(mapState, mapDispatch)(RequireLuaApi);

const WrappedOnTouchGui = props => <RequireLuaApi><OnTouchGui {...props} /></RequireLuaApi>;

OnTouchGui.propTypes = {
  StartConnection: PropTypes.func,
  FetchData: PropTypes.func,
  changePropertyValue: PropTypes.func,
  AddStoryTree: PropTypes.func,
  AddStoryInfo: PropTypes.func,
  ResetStoryInfo: PropTypes.func,
  storyIdentifier: PropTypes.objectOf(PropTypes.shape({})),
  story: PropTypes.objectOf(PropTypes.shape({})),
  anchorNode: PropTypes.objectOf(PropTypes.shape({})),
  scaleNodes: PropTypes.objectOf(PropTypes.shape({})),
  connectionLost: PropTypes.bool,
};

OnTouchGui.defaultProps = {
  StartConnection: () => {},
  FetchData: () => {},
  changePropertyValue: () => {},
  AddStoryTree: () => {},
  AddStoryInfo: () => {},
  ResetStoryInfo: () => {},
  storyIdentifier: {},
  story: {},
  anchorNode: {},
  scaleNodes: {},
  connectionLost: null
};

export default WrappedOnTouchGui;
