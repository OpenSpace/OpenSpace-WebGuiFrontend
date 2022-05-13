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
  NavigationAnchorKey, ZoomInLimitKey, ZoomOutLimitKey,
} from '../api/keys'


import StartJourney from '../components/Climate/startJourney'

import styles from './OnClimateGui.scss';
import { UpdateDeltaTimeNow } from '../utils/timeHelpers';

import {
  toggleShading, toggleHighResolution, toggleShowNode, toggleGalaxies,
  setStoryStart, showDevInfoOnScreen, storyFileParser, infoFileParser, flyTo,
} from '../utils/storyHelpers';

//------------------------------------------------------------------------------//
const KEYCODE_D = 68;


class OnClimateGui extends Component {
  constructor(props) {
    super(props);
    this.checkedVersion = false;
    this.state = {
      developerMode: false,
      currentStory: DefaultStory,
      sliderStartStory: DefaultStory,
      startJourney: DefaultStory,
    };

  }

// where we call api
 componentDidMount() {
    const { luaApi, FetchData, StartConnection } = this.props;
    this.props.StartConnection();


    document.addEventListener('keydown', this.handleKeyPress);
    //showDevInfoOnScreen(luaApi, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }

/*  setStory(selectedStory) {
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



  toggleDeveloperMode() {
    const { developerMode } = this.state;
    const { luaApi } = this.props;
    this.setState({ developerMode: !developerMode });

    showDevInfoOnScreen(luaApi, developerMode);
  }*/

  myStory(){
    console.log("hej")
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
        { developerMode && (
          <DeveloperMenu
            changeStory={this.changeStory}
            storyIdentifier={storyIdentifier}
          />
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
const mapStateToProps = state => ({
  connectionLost: state.connection.connectionLost,
  version: state.version,
});
const mapDispatchToProps = dispatch => ({
  startConnection: () => {
    dispatch(startConnection());
  },
});
OnClimateGui = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(OnClimateGui));

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

export default OnClimateGui;
