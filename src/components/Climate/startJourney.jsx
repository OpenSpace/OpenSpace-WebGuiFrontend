import React, { Component, useState } from "react";
import classNames from 'classnames'
import autoBind from 'react-autobind' //npm install
import { connect } from "react-redux";
import {
  setActionsPath,
  setPopoverVisibility,
  triggerAction,
} from "../../api/Actions";
import {
  refreshSessionRecording,
  subscribeToSessionRecording,
  unsubscribeToSessionRecording,
} from "../../api/Actions";
import {
  sessionStateIdle,
  sessionStatePaused,
  sessionStatePlaying,
  sessionStateRecording,
} from "../../api/keys";
import subStateToProps from "../../utils/subStateToProps";
import InfoBox from "../common/InfoBox/InfoBox";
import Button from "../common/Input/Button/Button";
import Input from "../common/Input/Input/Input";
import Select from "../common/Input/Select/Select";
import MaterialIcon from "../common/MaterialIcon/MaterialIcon";
import Popover from "../common/Popover/Popover";
import Row from "../common/Row/Row";
import styles from "./startJourney.scss";

import stories from "../../story_climate/climate_stories.json";
import AntarcticaButtom from "./antarcticaButtom.jsx"
import GreenlandButtom from "./greenlandButtom.jsx"
import Pick from "./pick_story.jsx"

class StartJourney extends Component {

  constructor(props) {

    super(props);
    autoBind(this)

    const {startNewJourney, storyInfo} =this.props;

    let startIndex = stories.climate_stories.findIndex(
      function (element) {
        return startNewJourney === element.identifier;
      }
    )
    // if startSlider was not in the listed stories, pick the first
    if (startIndex < 0) {
      startIndex = 0
    };

    this.state = {
      index : startIndex,
      isToggleOn: true,
      show: false,
      climate_stories: stories.climate_stories

    };
    //this.togglePopover = this.togglePopover.bind(this); //makes it possible to click at climate button


    this.onChangeStory      = this.onChangeStory.bind(this);
    this.getStoryGreenland  = this.getstorygreenland.bind(this);
    this.getstoryantarctica = this.getstoryantarctica.bind(this);
    this.toggle = this.toggle.bind(this);
    //this.setStory = this.setStory.bind(this);

  }
  toggle() {
     this.setState({
       isToggleOn: true,
       show: !this.state.show,
       climate_stories: stories.climate_stories

     });
   }

  onChangeStory(story) {
    this.props.changeStory(story);
    //this.props.changeStory(story);
    this.setState(prevState => ({
      isToggleOn: !prevState.isToggleOn
    }));
    //this.setStory(story.target.id)
    //this.setStory = this.setStory.bind(this);
  }

  getstorygreenland(){
    this.setState({ index: 0 });
    return(
      <pre className={styles.pre}>
        {JSON.stringify(this.stories, 4, 1) }
      </pre>

    );
  }

  getstoryantarctica(){
    this.setState({ index: 1 });

    /*<React.Fragment>
      <h1>Latest Users Posts</h1>
      <ul>
        {this.props.characters.map((... climate_stories)=>{
          return(<li key={this.climate_stories.title}>

        </li>);
        })}
      </ul>
    </React.Fragment>*/


}


  get getJson(){

    return(
      <pre className={styles.pre}>
        {JSON.stringify(this.climate_stories, 4, 1) }
      </pre>

    )


  }




  /*get popover() {
    var greenland;
    var antarctica;

    focusGreenland = (
      <Button
        block
        smalltext
        id="focusGreenland"
        value="HIDE"
        onClick={() => {
          this.getStoryGreenland();
        }}
        className={styles.menuButton}
        >
        <p>
          <MaterialIcon className={styles.buttonIcon} icon="ac_unit" />
        </p>
        Glaciers
      </Button>
    );

    focusAntarctica = (
      <Button
        id = "focusAntarctica"
        class = "gClass"
        block
        smalltext
        onClick={() => {
          this.getStoryAntarctica();
        }}
        className={styles.actionButton}
        >
        <p>
          <MaterialIcon className={styles.buttonIcon} icon="ac_unit" />
        </p>
        Antarctica
      </Button>
    );
    return (
      <section className={styles.hej}>
        <p>hejhej</p>
      </section>


    );
  }s*/


  render() {
    const story = Object.values(this.state.climate_stories)[this.state.index];
    if (!story) {
      console.log("ingen story")
      return null;
    }


    return (

    <div className={styles.Hej}>
          <h2>heeeeeej</h2>
          <h2>{this.state.climate_stories[1][1]}</h2>
            <Pick
              storyInfo={story}
              onChangeStory={this.onChangeStory}
            />
      <div className = {styles.TellStory}>


              <h1>Climate Picker Name </h1>
              <div className={styles.Header} onClick={this.toggle}>
                <strong>Debug</strong>
              </div>
              {this.state.show
              ? <div><h1>can't find file</h1></div> //cant find json file              )
              : ( this.getJson)
            }

            <AntarcticaButtom getstoryantarctica = {this.getstoryantarctica}/>
            <GreenlandButtom getstorygreenland  = {this.getstorygreenland} />
      </div>


          /*<button onClick={this.onChangeStory}>
            {this.state.isToggleOn ? 'ON' : 'OFF'}
          </button>*/

    </div>

    );
  }
}

const Post = (props) => {
  return (
    <div>
      <h2>{props.content}</h2>
      <h4>username: {props.user}</h4>
    </div>
  );
};

export default StartJourney;
