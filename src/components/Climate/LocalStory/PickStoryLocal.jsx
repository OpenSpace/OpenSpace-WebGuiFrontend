import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import styles from './LocalStory.scss';
import {
 DefaultStory,
} from '../../../api/keys'
import GetlocalStory from './GetlocalStory';
import DisplaylocalStory from './DisplaylocalStory'

class PickStoryLocal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStory: "default",
        }

    this.changeStory = this.changeStory.bind(this);
    this.setStory =   this.setStory.bind(this);
    this.resetStory = this.resetStory.bind(this);
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
    const {storyInfo, StoryStep, next, setShowStory} = this.props;
    const {currentStory} = this.state;
    console.table(setShowStory)
    return (
          <div>
            {(currentStory === DefaultStory)
              ?<div className = {styles.button}>
                  <div style={{width: 400+600*storyInfo.id}} >
                    <GetlocalStory changeStory = {this.setStory} climateStorys = {storyInfo} StoryStep = {StoryStep} setShowStory = {setShowStory}/>
                  </div>
              </div>
            : <div>
                <div className = {styles.button}>
                  <div style={{width: 400+600*storyInfo.id}} >
                    <GetlocalStory changeStory = {this.setStory} climateStorys = {storyInfo} StoryStep = {StoryStep} setShowStory = {setShowStory}/>
                  </div>
                </div>
                  <DisplaylocalStory climateStorys = {storyInfo}/>
              </div>
            }
          </div>
    );
  }
}

PickStoryLocal.propTypes = {
  setShowStory: PropTypes.func.isRequired,
  storyInfo: PropTypes.shape({
    title: PropTypes.string,
    info: PropTypes.string,
  }).isRequired,

};



export default PickStoryLocal;
