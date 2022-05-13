import React, { Component, useState } from "react";
import classNames from 'classnames'
import autoBind from 'react-autobind'
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
import buttonStyles from './Button.scss';

import  climate_stories from "../../story_climate/pick_story.json";
import AlaskaButton from "./AlaskaButton.jsx"
import AntarcticaButton from "./AntarcticaButton.jsx"
import GreenlandButton from "./GreenlandButton.jsx"
import { icons } from '../../api/resources';
import ClimatePanel from '../BottomBar/ClimatePanel.jsx'

class StartJourney extends Component {

  constructor(props) {

    super(props);
    autoBind(this)

    const {startNewJourney} =this.props;
    this.state = {
       isToggleOn: true,
       show: false,
       climate_stories: climate_stories.climate_stories

    };
    //this.togglePopover = this.togglePopover.bind(this); //makes it possible to click at climate button

    this.onChangeStory      = this.onChangeStory.bind(this);
    this.getStoryGreenland  = this.getstorygreenland.bind(this);
    this.getStoryAlaska  = this.getstoryalaska.bind(this);
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

  // Handle the click of a dot
  handleDotClick(i) {
    if (i === this.state.index) { return; }
    this.setState({ index: i });
  }

  getstorygreenland(){
    //climate_stories.greenland
    climate_stories.greenland.map((story) => {
      this.state.storyGreenland.title = story.title

    })
    return(
      <div><p>{this.state.storyGreenland}</p></div>
    )

  }

  getstoryalaska(){
    return(
      <div><p>greenland</p></div>
    )
  }

  getstoryantarctica(){
    this.props.luaApi.globebrowsing.flyToGeo(
      "Earth",
      -84.6081,
      94.7813,
      6990000.0000,
      7,
      true
    );
    /*return (
    <React.Fragment>
      <h1>Latest Users Posts</h1>
      <ul>
        {this.props.posts.map((this.climate_stories) => {
          return (
            <li key={this.climate_stories.title}>
              <AntarcticaButton {... this.climate_stories} />
            </li>
          );
        })}
      </ul>
    </React.Fragment>
  ); */
}



  /*get getJson(){

    return(
      <pre>
        {JSON.stringify(this.state.climate_stories, 4, 1) }
        //{JSON.stringify({ title: "Pick a story", description: "climate climate climate satellite satellite climate" }.title)}
      </pre>
    )


  }*/




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
  }*/

  get icon() {
    const { identifier } = this.props;
    const icon = icons[identifier];
    if (icon) {
      return <img src={icon} className={styles.iconImage} alt={identifier} />;
    }
    return <Icon icon="language" className={styles.Icon} />;
  }



  render() {
    return (
    <div className={styles.Hej}>
      <div className = {styles.TellStory}>
        <div className = "flex">
        {
          <div><h1>hej</h1>
          <h1>{this.state.storyGreenland}</h1>
          </div>,
          climate_stories.startpage.map((story) => {
            return (
              <div key = {story.id}>
                <h1 key = {story.title}>{ story.title}</h1>
                <p key= {story.info} >{story.info}</p>
              </div>
            );
          })

        }
        <br/>
        <br/>
        <br/>
        {
          climate_stories.pickstory.map((story) => {
            return (
              <div key = {story.id}>
                <h4 key = {story.title} > {story.title}</h4>
              </div>
            );
          })
        }
        </div>

        <AlaskaButton     getStoryAlaska     = {this.getStoryAlaska}/>
        <AntarcticaButton getStoryAntarctica = {this.getStoryAntarctica}/>
        <GreenlandButton  getStoryGreenland  = {this.getStoryGreenland} />
      </div>
    </div>
    );


  }
}

const App = () => {
  return (
    <div>
      <StartJourney posts={climate_stories} />
    </div>
  );
};
export default StartJourney;
