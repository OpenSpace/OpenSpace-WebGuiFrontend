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
    const {storyInfo, displayStory, storyStep} = this.props;
    const {currentStory} = this.state;
    //console.log("tjema")
    //console.table(displayStory)
    console.log(storyInfo.id)

    return (
          <div>
            {(currentStory === DefaultStory)
              ?<div className = {styles.button}>
              <div style={{height: 30+90*storyInfo.id}} >
                <GetlocalStory changeStory = {this.setStory} climateStorys = {storyInfo} displayStory = {displayStory}/>
              </div>
                </div>
            :  <DisplaylocalStory climateStorys = {storyInfo}/>
            }
          </div>


    );
  }
}

PickStoryLocal.propTypes = {
  storyStep: PropTypes.number,
  storyInfo: PropTypes.shape({
    title: PropTypes.string,
    info: PropTypes.string,
  }).isRequired,

};

export default PickStoryLocal;
