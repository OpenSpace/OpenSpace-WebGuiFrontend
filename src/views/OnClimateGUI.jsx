import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import {
  withRouter, HashRouter as Router, Route, Link,
} from 'react-router-dom';


import { formatVersion, isCompatible, RequiredOpenSpaceVersion, RequiredSocketApiVersion } from '../api/Version';

import KeybindingPanel from '../components/BottomBar/KeybindingPanel';

import '../styles/base.scss';
import Error from '../components/common/Error/Error';
import Overlay from '../components/common/Overlay/Overlay';
import BottomBar from '../components/BottomBar/BottomBar';
import Button from '../components/common/Input/Button/Button';
import Stack from '../components/common/Stack/Stack';
import ActionsPanel from '../components/BottomBar/ActionsPanel';
import Sidebar from '../components/Sidebar/Sidebar';
import NodeMetaContainer from '../components/NodeMetaPanel/NodeMetaContainer';
import NodePopOverContainer from '../components/NodePropertiesPanel/NodePopOverContainer';

import {
  setPropertyValue, startConnection, fetchData, addStoryTree, subscribeToProperty,
  unsubscribeToProperty, addStoryInfo, resetStoryInfo,
} from '../api/Actions';


import {
  ValuePlaceholder, DefaultStory, ScaleKey,
  NavigationAnchorKey,InfoIconKey, ZoomInLimitKey, ZoomOutLimitKey,
} from '../api/keys'


import StartJourney from '../components/Climate/startJourney'

import styles from './OnClimateGui.scss';
import { UpdateDeltaTimeNow } from '../utils/timeHelpers';

import {
  toggleShading, toggleHighResolution, toggleShowNode, toggleGalaxies,
  setStoryStart, showDevInfoOnScreen, storyFileParser, infoFileParser, flyTo,
} from '../utils/storyHelpers';
//import  climate_stories from "../../stories/stories.json";
//------------------------------------------------------------------------------//


class OnClimateGui extends Component {
  constructor(props) {
    super(props);
    this.checkedVersion = false;
    this.state = {
      developerMode: false,
      currentStory: DefaultStory,
      sliderStartStory: DefaultStory,
      //startJourney: climate_stories,
    };

    this.addStoryTree = this.addStoryTree.bind(this);
    this.changeStory = this.changeStory.bind(this);
    this.setStory = this.setStory.bind(this);
    this.resetStory = this.resetStory.bind(this);
    //this.checkStorySettings = this.checkStorySettings.bind(this);
    //this.handleKeyPress = this.handleKeyPress.bind(this);

  }

// where we call api
 componentDidMount() {
    const { luaApi, FetchData, StartConnection } = this.props;
    StartConnection();
    FetchData(InfoIconKey); //idk if we need this

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
    if (this.props.story.toggleboolproperties) {
      this.props.story.toggleboolproperties.forEach((property) => {
        const defaultValue = property.defaultvalue ? true : false;
        if (property.isAction) {
          if (defaultValue) {
            this.props.triggerActionDispatcher(property.actionEnabled);
          }
          else {
            this.props.triggerActionDispatcher(property.actionDisabled);
          }
        }
        else {
          this.props.changePropertyValue(property.URI, defaultValue);
        }
      });
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


  resetStory() {
    const { luaApi } = this.props;
    const { currentStory } = this.state;

    this.state.startJourney = currentStory;
    UpdateDeltaTimeNow(luaApi, 1);
    this.setStory(DefaultStory);
  }

  render() {
    //let storyIdentifier = [];
    const { connectionLost, story, storyIdentifier } = this.props;
    const { currentStory, developerMode, sliderStartStory, startJourney } = this.state;

    return (

      <div className={styles.app}>

        { connectionLost && (
          <Overlay>
            <Error>
              Connection lost. Trying to reconnect again soon.
            </Error>
          </Overlay>
        )}
        <p className={styles.storyTitle}>
          {story.title}
        </p>

        <section className={styles.Grid__Left}>
          <StartJourney startNewJourney ={startJourney} />

          <Sidebar/>
        </section>
        <section className={styles.Grid__Right}>
          <NodePopOverContainer/>
          <NodeMetaContainer/>
          <BottomBar showFlightController={this.props.showFlightController}/>
          <KeybindingPanel />
        </section>
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
    version: state.version,
  };
};

const mapDispatchToProps = dispatch => ({
  startConnection: () => {
    dispatch(startConnection());
  },
  changePropertyValue: (uri, value) => {
    dispatch(setPropertyValue(uri, value));
  },
  triggerActionDispatcher: (action) => {
    dispatch(triggerAction(action));
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



OnClimateGui = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(OnClimateGui));












// ----------------------------------




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

const WrappedOnTouchGui = props => <RequireLuaApi><OnClimateGui {...props} /></RequireLuaApi>;

OnClimateGui.propTypes = {
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

OnClimateGui.defaultProps = {
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
