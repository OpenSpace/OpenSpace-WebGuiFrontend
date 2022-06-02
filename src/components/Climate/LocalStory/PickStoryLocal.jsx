import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import styles from './LocalStory.scss';
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
        }


    this.setStory =   this.setStory.bind(this);
    this.handleStory = this.handleStory.bind(this);
    this.Increment = this.Increment.bind(this);

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

   Increment = () => {
         this.setState((prevState) => ({
           LocalStep: prevState.LocalStep + 1,

     }));
   }

   handleStory(e) {
     console.log("hej " + this.state.currentStory)
     this.setStory(e.target.id);
     this.props.setShowStory(false);


     this.setState((prevState) => ({
       currentStory: "default"

     }));
     console.log("hej igen " + this.state.currentStory);

   }




  render() {
    const {storyInfo, StoryStep, next } = this.props;
    const {currentStory,showLocalStory} = this.state;
    console.log(currentStory)

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

            {(currentStory != DefaultStory) && showLocalStory == true &&
              <div>
                  <DisplaylocalStory
                    climateStorys = {storyInfo}
                    setLocalStory = {(newState) => this.setState({
                      currentStory: "default"
                    })}
                    />
             </div>

            }
            {currentStory == DefaultStory &&
              <div><h2>hejhej</h2></div>


            }
          </div>
    );
  }
}

PickStoryLocal.propTypes = {
  StoryIndex: PropTypes.number.isRequired,
  setShowStory: PropTypes.func.isRequired,
  storyInfo: PropTypes.shape({
    title: PropTypes.string,
    info: PropTypes.string,
  }).isRequired,

};



export default PickStoryLocal;
