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
import BottomBar from '../components/Climate/BottomMenu/ClimateBar';
import Button from '../components/common/Input/Button/Button';

import ActionsPanel from '../components/BottomBar/ActionsPanel';
import Sidebar from '../components/Sidebar/Sidebar';
import NodeMetaContainer from '../components/NodeMetaPanel/NodeMetaContainer';
import NodePopOverContainer from '../components/NodePropertiesPanel/NodePopOverContainer';
import ExploreClimate from '../components/climate/ExploreClimate'
import {
  setPropertyValue, startConnection, fetchData, addStoryTree, subscribeToProperty,
  unsubscribeToProperty, addStoryInfo, resetStoryInfo,
} from '../api/Actions';

import climate_stories from "../story_climate/pick_story.json";
import {
  ValuePlaceholder, DefaultStory, ScaleKey,
  NavigationAnchorKey,InfoIconKey, ZoomInLimitKey, ZoomOutLimitKey,
} from '../api/keys'


import StartJourney from '../components/Climate/startJourney'

import styles from './OnClimateGui.scss';
import { UpdateDeltaTimeNow, setDateToNow } from '../utils/timeHelpers';

import {
  storyGetLayer, storyGetLocation, satelliteToggle, toggleShowNode,
  storyFileParserClimate, storyResetLayer, storyGetIdleBehavior
} from '../utils/storyHelpers';
//import  climate_stories from "../../stories/stories.json";
//------------------------------------------------------------------------------//


class OnClimateGui extends Component {
  constructor(props) {
    super(props);
    this.checkedVersion = false;
    this.state = {
      developerMode: false,
      currentStory: "default",
      json: "defualt",
      startJourney: "default",
      climate_stories: climate_stories,
      NoShow: "noShow",
    };
    this.addStoryTree = this.addStoryTree.bind(this);
    this.setStory = this.setStory.bind(this);
    this.resetStory = this.resetStory.bind(this);
    this.addStoryTree = this.addStoryTree.bind(this);
    this.noShow = this.noShow.bind(this);

  }

// where we call api
 componentDidMount() {
    this.setState({ data: [] });
    const { luaApi, FetchData, StartConnection } = this.props;
    StartConnection();
  }

 setStory(selectedStory) {
    const {
      changePropertyValue, luaApi, scaleNodes, story, storyIdentifier, currentStory
    } = this.props;


    const previousStory = currentStory;
    this.setState({ currentStory: selectedStory });

    // Return if the selected story is the same as the OpenSpace property value
    if (previousStory === selectedStory) {
      return;
    }
    const getJson = this.addStoryTree(selectedStory);

    this.setState({json: getJson});

    //remove satelites from start profile
    satelliteToggle(luaApi, false);

    //changePropertyValue(anchorNode.description.Identifier, json.start.planet);
    // Check settings of the previous story and reset values
    this.checkStorySettings(story, true);
    // Check and set the settings of the current story
    this.checkStorySettings(getJson, false);
  }

  checkStorySettings(story, value) {
    const { luaApi } = this.props;

    const oppositeValue = !value;
    if (story.hidenodes) {
      story.hidenodes.forEach(node => toggleShowNode(luaApi, node, value));
    }
  }

  // Read in json-file for new story and add it to redux
  addStoryTree(selectedStory) {
    const { AddStoryTree, AddStoryInfo, ResetStoryInfo } = this.props;
    const storyFile =  storyFileParserClimate(selectedStory);

    //AddStoryTree(storyFile);
    return storyFile;
  }

  noShow(){

    const { luaApi } = this.props;
    const {currentStory, NoShow} = this.state;


    this.setState({
      currentStory: NoShow
    })
    this.setStory(NoShow);

  }


  resetStory() {
    const { luaApi } = this.props;
    const { currentStory } = this.state;
    storyResetLayer(luaApi);
    this.setState({startJourney: currentStory});
    UpdateDeltaTimeNow(luaApi, 1);
    this.setStory(DefaultStory);
    //remove satelites from start profile
    satelliteToggle(luaApi, true);

    //spin earth
    storyGetIdleBehavior(luaApi, 0, true);
    // get orginal story position

    climate_stories.startpage.map((story) => {
      return (
          storyGetLocation(luaApi, story.pos, UpdateDeltaTimeNow(luaApi, 1)),
          storyGetLayer(luaApi, story.toggleboolproperties)
          );
        });
  }


  render() {
    //let storyIdentifier = [];
    const {  connectionLost,  } = this.props;
    const { currentStory, json, luaApi, NoShow } = this.state;


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
          {this.state.data}
        </p>
        <section className={styles.Grid__Left}>


        {(currentStory === DefaultStory )
          ? <StartJourney changeStory = {this.setStory}/>
        : <ExploreClimate resetStory = {this.resetStory} json = {json} currentStory= {currentStory}/>
        }

        <Sidebar/>


        </section>
        <section className={styles.Grid__Right}>
          <NodePopOverContainer/>
        <NodeMetaContainer/>
          <BottomBar resetStory={this.resetStory} setNoShow = {this.noShow} showTimeController ={true} />
        <KeybindingPanel />
        </section>

      </div>
    );
}
}
const mapStateToProps = state => {
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
  triggerActionDispatcher: (action) => {
    dispatch(triggerAction(action));
  },
  /*FetchData: (id) => {
    dispatch(fetchData(id));
  },*/
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
  changePropertyValue: (uri, value) => {
    dispatch(setPropertyValue(uri, value));
  },
  triggerActionDispatcher: (action) => {
    dispatch(triggerAction(action));
  },
  FetchData: (id) => {
    dispatch(fetchData(id));
  },

});
OnClimateGui = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(OnClimateGui));













// ----------------------------------



// Because some of the functionality in OnClimate Gui requires the luaApi
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

const WrappedOnClimateGui = props => <RequireLuaApi><OnClimateGui {...props} /></RequireLuaApi>;

OnClimateGui.propTypes = {
  StartConnection: PropTypes.func,
  //FetchData: PropTypes.func,
  changePropertyValue: PropTypes.func,
  AddStoryTree: PropTypes.func,
  AddStoryInfo: PropTypes.func,
  ResetStoryInfo: PropTypes.func,
  storyIdentifier: PropTypes.objectOf(PropTypes.shape({})),
  story: PropTypes.objectOf(PropTypes.shape({})),
  scaleNodes: PropTypes.objectOf(PropTypes.shape({})),
  connectionLost: PropTypes.bool,
  setStory: PropTypes.func,


};

OnClimateGui.defaultProps = {
  StartConnection: () => {},
  //FetchData: () => {},
  changePropertyValue: () => {},
  AddStoryTree: () => {},
  AddStoryInfo: () => {},
  ResetStoryInfo: () => {},
  storyIdentifier: {},
  story: {},

  scaleNodes: {},
  connectionLost: null
};

export default WrappedOnClimateGui;
