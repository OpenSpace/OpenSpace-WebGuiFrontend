import React, { Component, useState } from "react";
import classNames from 'classnames'
import autoBind from 'react-autobind'
import { connect } from "react-redux";
import PropTypes from 'prop-types';
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
  DefaultStory,
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
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';

import StoryButton from './StoryButton';
import Selectstorybutton from './selectStoryButton';
import PickStory from './pick_story'

import stories from "../../story_climate/climate_stories.json";
import climate_stories from "../../story_climate/pick_story.json";
import AlaskaButton from "./AlaskaButton.jsx"
import AntarcticaButton from "./AntarcticaButton.jsx"
import GreenlandButton from "./GreenlandButton.jsx"
import { icons } from '../../api/resources';
import ClimatePanel from '../BottomBar/ClimatePanel.jsx'
class StartJourney extends Component {

  constructor(props) {

    super(props);
    const {startNewJourney} = this.props;

    let startIndex = stories.stories.findIndex(

      function (element) {
        return startNewJourney === element.identifier;
      }
    )

    // if startNewJourney was not in the listed stories, pick the first
    if (startIndex < 0) {
      startIndex = 0
    };

    this.state = {
      index: startIndex,
       isToggleOn: true,
       show: false,
       climate_stories: climate_stories,
       stories: stories.stories,
       getstorygreenland : DefaultStory,
       storiesArray: []

    };
    //this.togglePopover = this.togglePopover.bind(this); //makes it possible to click at climate button

    for (let i = 0; i < Object.values(this.state.stories); i++) {
      this.state.storiesArray.push(Object.values(this.state.stories)[i]);
    }

    this.getstorygreenland  = this.getstorygreenland.bind(this);
    this.getStoryAlaska  = this.getstoryalaska.bind(this);
    this.getstoryantarctica = this.getstoryantarctica.bind(this);
    this.toggle = this.toggle.bind(this);
    //this.handleStory = this.handleStory.bind(this);
    this.onChangeStory = this.onChangeStory.bind(this);
    //this.setStory = this.setStory.bind(this);

  }
  onChangeStory(story) {
    this.props.changeStory(story);
  }

  toggle() {
     this.setState({
       isToggleOn: true,
       show: !this.state.show,
       climate_stories: climate_stories,
       getstorygreenland: {climate_stories: null}

     });
   }




  getstorygreenland(){
    //climate_stories.greenland
    this.setState({ index: this.state.index + 2 });



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
    //const { identifier } = this.props;
    const icon = icons[identifier];
    if (icon) {
      return <img src={icon} className={styles.iconImage} alt={identifier} />;
    }
    return <Icon icon="language" className={styles.Icon} />;
  }

  render() {
    const story = Object.values(this.state.stories)[this.state.index];
      //console.log("f " + this.props.changeStory);
    if (!this.state.storiesArray) {
      return null;
    }

    return (

    <div className={styles.Hej}>
      <div className = {styles.TellStory}>
        <div className = "flex">
        {


          climate_stories.startpage.map((story) => {
            return (
              <div key = {story.id}>
                <h1 key = {story.title}>{story.title}</h1>
                <p
                  key= {story.info}>{story.info}</p>

              </div>

            );
          })

        }
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>

        <div className = {styles.TellStory}>
          <div className ={styles.break} >


                  {this.state.stories.map((story, index) => {
                      return(
                        <span key = {index}>
                        <PickStory key = {index}
                          storyInfo = {story}
                          onChangeStory = {this.onChangeStory}
                        />
                        <br/>

                        </span>
                    );
                  })}

              </div>
        </div>

      /*  <AlaskaButton     getStoryAlaska     = {this.getStoryAlaska}/>
        <AntarcticaButton getStoryAntarctica = {this.getStoryAntarctica}/>
        <GreenlandButton  getStoryGreenland  = {this.getStoryGreenland} />*/
      </div>
    </div>
  </div>
    );


  }
}


StartJourney.propTypes = {
 changeStory: PropTypes.func.isRequired,

};






export default StartJourney;
