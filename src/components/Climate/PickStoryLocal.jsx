import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import styles from '../Climate/Button.scss';
import {
 DefaultStory,
} from '../../api/keys'
import GetlocalStory from '../Climate/GetlocalStory';

class PickStoryLocal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStory: "default",
        }

    this.changeStory = this.changeStory.bind(this);
    this.setStory =   this.setStory.bind(this);
  }

  changeStory(e) {
    this.setStory(e.target.id);
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
   }

  render() {
    const { storyInfo } = this.props;
    const {currentStory} = this.state;
    //console.log(storyInfo)
    //console.table(storyInfo.title)

    return (
          <div style={{height: 40+1*storyInfo.id}} >
            {(currentStory === DefaultStory)
              ? <GetlocalStory changeStory = {this.setStory} climateStorys = {storyInfo}/>
             :  <div><h1>hej</h1></div>
            }
          </div>
    );
  }
}

PickStoryLocal.propTypes = {
  storyInfo: PropTypes.shape({
    title: PropTypes.string,
    info: PropTypes.string,
  }).isRequired,
};

export default PickStoryLocal;
