import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { HashRouter as Router, Link, Route, withRouter } from 'react-router-dom';
import { 
  addStoryInfo, addStoryTree, fetchData, resetStoryInfo, setPropertyValue, 
  startConnection, subscribeToProperty, unsubscribeToProperty 
} from '../api/Actions';
import { 
  DefaultStory, InfoIconKey, NavigationAnchorKey, ScaleKey, 
  ValuePlaceholder, ZoomInLimitKey, ZoomOutLimitKey 
} from '../api/keys';
import { formatVersion, isCompatible, RequiredOpenSpaceVersion, RequiredSocketApiVersion } from '../api/Version';
import Error from '../components/common/Error/Error';
import Overlay from '../components/common/Overlay/Overlay';
import Stack from '../components/common/Stack/Stack';
import Slider from '../components/ImageSlider/Slider';
import TouchBar from '../components/TouchBar/TouchBar';
import DeveloperMenu from '../components/TouchBar/UtilitiesMenu/presentational/DeveloperMenu';
import '../styles/base.scss';
import {
  flyTo, infoFileParser, setStoryStart, showDevInfoOnScreen, storyFileParser, 
  toggleGalaxies, toggleHighResolution, toggleShading, toggleShowNode 
} from '../utils/storyHelpers';
import { UpdateDeltaTimeNow } from '../utils/timeHelpers';
import About from './About/About';
import styles from './OnTouchGui.scss';

const KEYCODE_D = 68;

class OnTouchGui extends Component {
  constructor(props) {
    super(props);
    this.checkedVersion = false;
    this.state = {
      developerMode: false,
      currentStory: DefaultStory,
      sliderStartStory: DefaultStory
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

    showDevInfoOnScreen(this.props.luaApi, false);
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
  }

  setStory(selectedStory) {
    const previousStory = this.props.storyIdentifier;
    this.setState({ currentStory: selectedStory });

    // Return if the selected story is the same as the OpenSpace property value
    if (previousStory === selectedStory)
      return;

    const json = this.addStoryTree(selectedStory);

    // Set all the story specific properties
    this.props.changePropertyValue(this.props.anchorNode.description.Identifier, json.start.planet);
    setStoryStart(this.props.luaApi, json.start.location, json.start.date);

    if(json.overviewlimit){
      this.props.changePropertyValue(ZoomOutLimitKey, json.overviewlimit);
    }
    if(json.inzoomlimit){
      this.props.changePropertyValue(ZoomInLimitKey, json.inzoomlimit);
    }else{
      json.inzoomlimit = 1.0;
      this.props.changePropertyValue(ZoomInLimitKey, 1.0);
    }
    if (json.start.overviewzoom){
      flyTo(this.props.luaApi, json.overviewlimit);
    }

    this.props.changePropertyValue(this.props.anchorNode.description.Identifier, json.start.planet);

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
        const defaultValue = property.defaultvalue ? true : false;
        this.props.changePropertyValue(property.URI, defaultValue);
      });
    }
  }

  resetStory () {
    this.state.sliderStartStory = this.state.currentStory;
    UpdateDeltaTimeNow(this.props.luaApi, 1);
    this.setStory(DefaultStory);
  }

  checkStorySettings(story, value) {
    const oppositeValue = value ? false : true;

    if (story.hidenodes) {
      story.hidenodes.forEach(node => toggleShowNode(this.props.luaApi, node, value));
    }
    if (story.highresplanets) {
      story.highresplanets.forEach(node => toggleHighResolution(this.props.luaApi, node, oppositeValue));
    }
    if (story.noshadingplanets) {
      story.noshadingplanets.forEach(node => toggleShading(this.props.luaApi, node, value));
    }
    if (story.galaxies) {
      toggleGalaxies(this.props.luaApi, oppositeValue);
    }
  }

  // Read in json-file for new story and add it to redux
  addStoryTree(selectedStory) {

    const storyFile = storyFileParser(selectedStory);

    this.props.AddStoryTree(storyFile);
    if (storyFile.infoiconsfile) {
      const info = infoFileParser(storyFile.infoiconsfile);

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

    if (this.state.developerMode) {
      showDevInfoOnScreen(this.props.luaApi, true);
    } else {
      showDevInfoOnScreen(this.props.luaApi, false);
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
            storyIdentifier={this.props.storyIdentifier}
          />
        }
        <p className={styles.storyTitle}> {this.props.story.title} </p>
        {(this.state.currentStory === DefaultStory)
          ? <Slider startSlider = {this.state.sliderStartStory} changeStory={this.setStory} />
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

  // TODO (emmbr, 2022-01-18): For some reason, it takes a while for the property
  // tree to load when showing this UI in a browser. If this happens, these 
  // properties are not set up correctly, and the UI crashes when trying to create 
  // select a new story. Not great, should be investigated :) 

  storyIdentifier = story.identifier;
  anchorNode = state.propertyTree.properties[NavigationAnchorKey];

  if (story.scalenodes) {
    story.scalenodes.nodes.forEach((node) => {
      let foundScaleNode = state.propertyTree.properties[ScaleKey.replace(ValuePlaceholder, `${node}`)];

      if (foundScaleNode) {
        scaleNodes.push(foundScaleNode);
      }
    });
  }

  return {
    storyIdentifier,
    connectionLost: state.connection.connectionLost,
    story,
    reset: state.storyTree.reset,
    anchorNode,
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
  storyIdentifier: PropTypes.objectOf(PropTypes.shape({})),
  story: PropTypes.objectOf(PropTypes.shape({})),
  anchorNode: PropTypes.objectOf(PropTypes.shape({})),
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
  storyIdentifier: {},
  story: {},
  anchorNode: {},
  scaleNodes: {},
  connectionLost: null,
  reset: null,
};

export default WrappedOnTouchGui;
