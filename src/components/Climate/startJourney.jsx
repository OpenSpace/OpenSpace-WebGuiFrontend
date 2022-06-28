import React, { Component, useState } from "react";
import classNames from 'classnames'
import autoBind from 'react-autobind'
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import {
  DefaultStory,
} from "../../api/keys";
import styles from "./startJourney.scss";
import buttonStyles from './Button.scss';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import PickStory from './pick_story'
import stories from "../../story_climate/climate_stories.json";
import climate_stories from "../../story_climate/pick_story.json";
import { icons } from '../../api/resources';

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
       show: false,
       climate_stories: climate_stories,
       stories: stories.stories,
       storiesArray: []
    };
    this.onChangeStory = this.onChangeStory.bind(this);
  }
  onChangeStory(story) {
    this.props.changeStory(story);

  }

  render() {
    if (!this.state.storiesArray) {
      return null;
    }

    return (
    <div className={styles.StoryPosistion}>
      <div className = {styles.TellStory}>
        <div>
        {
          climate_stories.startpage.map((story) => {
            return (
              <div key = {story.id}>
                <h1 key = {story.title}>{story.title}</h1>
                <p key= {story.info}>{story.info}</p>
              </div>
            );
          })
        }
        <br/>
        {this.state.stories.map((story, index) => {
            return(
              <PickStory key = {index}
                storyInfo = {story}
                onChangeStory = {this.onChangeStory}
              />
          );
        })}
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
