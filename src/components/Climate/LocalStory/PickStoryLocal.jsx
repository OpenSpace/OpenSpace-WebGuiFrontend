import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import styles from '../LocalStory/localStory.scss';
import {
 DefaultStory,
} from '../../../api/keys'
import GetlocalStory from './GetlocalStory';
import DisplaylocalStory from './DisplaylocalStory'
import StoryButton from './StoryButtonLocal';

class PickStoryLocal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStory: "default",
      showLocalStory: false,
      LocalStep: 0,
      initialState: "default",
        }


    this.setStory =   this.setStory.bind(this);
    this.handleStory = this.handleStory.bind(this);


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



   handleStory(e) {


     //this.setStory(e.target.id);
     this.props.setShowStory(false);
     this.props.setCurrentStory(e.target.id)

   }




  render() {
    const {storyInfo, StoryStep, storyLength, storyIndex, currentStory } = this.props;
    const {showLocalStory,initialState } = this.state;
    console.log("refffddddfdnfdffer " + this.state.currentStory)


    return (
      <div>
          <div className = {styles.button}>
              <div style={{width: 400+600*storyInfo.id}} >
                <StoryButton
                  pickStory = {this.handleStory}
                  storyIdentifier= {storyInfo.title}
                />
              </div>
          </div>
          <div>
            {(currentStory == storyInfo.title) &&
                <DisplaylocalStory
                  climateStorys = {storyInfo}
                  />
            }

          </div></div>
    );
  }
}

PickStoryLocal.propTypes = {

  def: PropTypes.func.isRequired,

  storyIndex:  PropTypes.number.isRequired,
  setShowStory: PropTypes.func.isRequired,
  storyInfo: PropTypes.shape({
    title: PropTypes.string,
    info: PropTypes.string,
  }).isRequired,

};



export default PickStoryLocal;
