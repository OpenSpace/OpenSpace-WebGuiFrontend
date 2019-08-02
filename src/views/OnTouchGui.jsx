import React, { Component } from 'react';
import { withRouter, HashRouter as Router, Route, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import '../styles/base.scss';
import Sidebar from '../components/Sidebar/Sidebar';
import BottomBar from '../components/BottomBar/BottomBar';
import Error from '../components/common/Error/Error';
import Overlay from '../components/common/Overlay/Overlay';
import About from './About/About';
import Stack from '../components/common/Stack/Stack';

import {
  setPropertyValue, startConnection, fetchData, addStoryTree, subscribeToProperty,
  unsubscribeToProperty, addStoryInfo, resetStoryInfo,
} from '../api/Actions';
import TouchBar from '../components/TouchBar/TouchBar';
import styles from './OnTouchGui.scss';
import {
  InfoIconKey, ValuePlaceholder, StoryIdentifierKey, FocusNodesListKey, 
  DefaultStory, OverlimitKey, ScaleKey, ZoomInLimitKey, NavigationAnchorKey
} from '../api/keys';
import Slider from '../components/ImageSlider/Slider';
import { UpdateDeltaTimeNow } from '../utils/timeHelpers';
import { toggleShading, toggleHighResolution, toggleHidePlanet, toggleGalaxies, 
         toggleZoomOut, setStoryStart, hideDevInfoOnScreen, showDistanceOnScreen, 
         addStoryTags, removeStoryTags, storyFileParser, infoFileParser
} from '../utils/storyHelpers';
import DeveloperMenu from '../components/TouchBar/UtilitiesMenu/presentational/DeveloperMenu';
import { isCompatible,
         formatVersion,
         RequiredSocketApiVersion,
         RequiredOpenSpaceVersion } from '../api/Version';

const KEYCODE_D = 68;

class OnTouchGui extends Component {
  constructor(props) {
    super(props);
    this.checkedVersion = false;
    this.state = {
      developerMode: false,
      currentStory: DefaultStory
    };

    this.changeStory = this.changeStory.bind(this);
    this.setStory = this.setStory.bind(this);
    this.resetStory = this.resetStory.bind(this);
    this.checkStorySettings = this.checkStorySettings.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.toggleDeveloperMode = this.toggleDeveloperMode.bind(this);
  }

  componentDidMount() {
    this.props.StartConnection();
    this.props.FetchData(InfoIconKey);

    document.addEventListener('keydown', this.handleKeyPress);

    hideDevInfoOnScreen(this.props.luaApi, true);
    showDistanceOnScreen(this.props.luaApi, false);

    this.props.startListening(StoryIdentifierKey);
    this.props.startListening(FocusNodesListKey);
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

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
    this.props.stopListening(StoryIdentifierKey);
    this.props.stopListening(FocusNodesListKey);
  }

  setStory(selectedStory) {
    const {
      storyIdentifierNode, applyRemoveTag, focusNodesList, applyAddTag, anchorNode, overViewNode,
    } = this.props;

    const previousStory = storyIdentifierNode.value;
    this.setState({ currentStory: selectedStory });

    // Return if the selected story is the same as the OpenSpace property value
    if (previousStory === selectedStory)
      return;

    // If the previous story had an empty focus node list
    if (focusNodesList.value.length !== 0) {
      const focusNodes = focusNodesList.value.split(',');
      removeStoryTags(this.props.luaApi, focusNodes);
    }

    const json = this.addStoryTree(selectedStory);
    
    // If the current story is the default - hide distance info on screen
    if (selectedStory === DefaultStory) {
      showDistanceOnScreen(this.props.luaApi, false);
    }
    else {
      showDistanceOnScreen(this.props.luaApi, true);
    }

    // Set all the story specific properties
    this.props.changePropertyValue(storyIdentifierNode.description.Identifier, selectedStory);
    if (json.focusbuttons) {
      this.props.changePropertyValue(focusNodesList.description.Identifier, json.focusbuttons.toString());

      if (json.focusbuttons.length !== 0) {
        addStoryTags(this.props.luaApi,json.focusbuttons);
      }
    } else {
      this.props.changePropertyValue(focusNodesList.description.Identifier, "");
    }
    this.props.changePropertyValue(anchorNode.description.Identifier, json.start.planet);
    this.props.changePropertyValue(overViewNode.description.Identifier, json.overviewlimit);
    setStoryStart(this.props.luaApi, json.start.location, json.start.date, json.overviewlimit);

    // Check settings of the previous story and reset values
    this.checkStorySettings(this.props.story, true);
    // Check and set the settings of the current story
    this.checkStorySettings(json, false);

    // If the previous story scaled planets reset value
    if (this.props.story.scalenodes) {
      this.props.scaleNodes.forEach((node) => {
        this.props.changePropertyValue(node.description.Identifier, 1);
      });
    }
    // If the previous story toggled bool properties reset them to default value
    if (this.props.story.toggleboolproperties) {
      this.props.story.toggleboolproperties.forEach((property) => {
        const defaultValue = (property.defaultvalue === true) ? true : false;
        this.props.luaApi.setPropertyValue(property.URI, defaultValue);
      });
    }
    
  }

  resetStory () {
    UpdateDeltaTimeNow(this.props.luaApi, 1);
    this.setStory(DefaultStory);
  }

  checkStorySettings(story, value) {
    const oppositeValue = (value === true) ? false : true;

    if (story.hidenodes) {
      story.hidenodes.forEach(planet => toggleHidePlanet(this.props.luaApi, planet, value));
    }
    if (story.highresplanets) {
      story.highresplanets.forEach(planet => toggleHighResolution(this.props.luaApi, planet, oppositeValue));
    }
    if (story.noshadingplanets) {
      story.noshadingplanets.forEach(planet => toggleShading(this.props.luaApi, planet, value));
    }
    if (story.galaxies) {
      toggleGalaxies(this.props.luaApi, oppositeValue);
    }
    if (story.inzoomlimit) {
      const zoomLimit = (value === true) ? 0 : Number(story.inzoomlimit);
      this.props.changePropertyValue(this.props.zoomInNode.description.Identifier, zoomLimit);
    }
    if (story.zoomout) {
      toggleZoomOut(this.props.luaApi, oppositeValue);
    }
  }

  // Read in json-file for new story and add it to redux
  addStoryTree(selectedStory) {

    const storyFile = storyFileParser(selectedStory);

    this.props.AddStoryTree(storyFile);
    if (storyFile.infofile) {
      const info = infoFileParser(storyFile.infofile);

      this.props.AddStoryInfo(info);
    } else {
      this.props.ResetStoryInfo();
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
    this.setState({ developerMode: !this.state.developerMode });

    if (this.state.developerMode === true) {
      hideDevInfoOnScreen(this.props.luaApi, false);
    } else {
      hideDevInfoOnScreen(this.props.luaApi, true);
    }
  }

  render() {
    return (
      <div className={styles.app}>

        {<Router basename="/ontouch/">
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
        </Router>}

        { this.props.connectionLost && (
          <Overlay>
            <Error>
              Connection lost. Trying to reconnect again soon.
            </Error>
          </Overlay>
        )}
        {this.state.developerMode &&
          <DeveloperMenu
            changeStory={this.changeStory}
            storyIdentifier={this.props.storyIdentifierNode.value}
          />}
        <p className={styles.storyTitle}> {this.props.story.storytitle} </p>
        {(this.state.currentStory === DefaultStory)
          ? <Slider changeStory={this.setStory} /> : <TouchBar resetStory={this.resetStory} />
        }      
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let storyIdentifierNode = [];
  let focusNodesList = [];
  let anchorNode;
  let overViewNode;
  let zoomInNode;
  const scaleNodes = [];
  const story = state.storyTree.story;

  if (state.propertyTree !== undefined) {
    storyIdentifierNode = state.propertyTree.properties[StoryIdentifierKey];
    focusNodesList = state.propertyTree.properties[FocusNodesListKey];
    anchorNode = state.propertyTree.properties[NavigationAnchorKey];
    overViewNode = state.propertyTree.properties[OverlimitKey];
    zoomInNode = state.propertyTree.properties[ZoomInLimitKey];

    if (story.scalenodes) {
      story.scalenodes.nodes.forEach((node) => {
        let foundScaleNode = state.propertyTree.properties[ScaleKey.replace(ValuePlaceholder, `${node}`)];

        if (foundScaleNode) {
          scaleNodes.push(foundScaleNode);
        }
      });
    }
  }

  return {
    focusNodesList,
    storyIdentifierNode,
    connectionLost: state.connection.connectionLost,
    story,
    reset: state.storyTree.reset,
    anchorNode,
    overViewNode,
    zoomInNode,
    scaleNodes,
    luaApi: state.luaApi
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
    this.props.StartConnection();
  }

  render() {
    if (!this.props.luaApi) {
      return null;
    }
    return <>{this.props.children}</>;
  }
}

const mapState = state => {
  return {
    luaApi: state.luaApi,
  }
};

const mapDispatch = dispatch => ({
  StartConnection: () => {
    dispatch(startConnection());
  }
})

RequireLuaApi = connect(mapState, mapDispatch)(RequireLuaApi);

const WrappedOnTouchGui = (props) => <RequireLuaApi><OnTouchGui {...props} /></RequireLuaApi>

OnTouchGui.propTypes = {
  StartConnection: PropTypes.func,
  FetchData: PropTypes.func,
  changePropertyValue: PropTypes.func,
  startListening: PropTypes.func,
  AddStoryTree: PropTypes.func,
  AddStoryInfo: PropTypes.func,
  ResetStoryInfo: PropTypes.func,
  storyIdentifierNode: PropTypes.objectOf(PropTypes.shape({})),
  story: PropTypes.objectOf(PropTypes.shape({})),
  focusNodesList: PropTypes.objectOf(PropTypes.shape({})),
  anchorNode: PropTypes.objectOf(PropTypes.shape({})),
  overViewNode: PropTypes.objectOf(PropTypes.shape({})),
  zoomInNode: PropTypes.objectOf(PropTypes.shape({})),
  scaleNodes: PropTypes.objectOf(PropTypes.shape({})),
  connectionLost: PropTypes.bool,
  reset: PropTypes.bool,
};

OnTouchGui.defaultProps = {
  StartConnection: () => {},
  FetchData: () => {},
  changePropertyValue: () => {},
  startListening: () => {},
  AddStoryTree: () => {},
  AddStoryInfo: () => {},
  ResetStoryInfo: () => {},
  storyIdentifierNode: {},
  story: {},
  focusNodesList: {},
  anchorNode: {},
  overViewNode: {},
  zoomInNode: {},
  scaleNodes: {},
  connectionLost: null,
  reset: null,
};

export default WrappedOnTouchGui;
