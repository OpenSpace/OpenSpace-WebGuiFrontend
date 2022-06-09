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

import {
  storyGetLayer, storyGetLocation, storyResetLayer
} from '../../../utils/storyHelpers';

class PickStoryLocal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStory: "default",

        }

    this.handleStory = this.handleStory.bind(this);
  }

   handleStory(e) {
     const {storyInfo, setShowStory, setCurrentStory, luaApi} = this.props
     setShowStory(false);
     setCurrentStory(e.target.id)

   }

  render() {
    const {storyInfo, currentStory } = this.props;
    return (
      <div>
          <div className = {styles.button}>

              <div style={{height: 100*storyInfo.id}} >
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
                  luaApi = {this.props.luaApi}
                  />
            }

          </div></div>
    );
  }
}

PickStoryLocal.propTypes = {
  setShowStory: PropTypes.func.isRequired,
  storyInfo: PropTypes.shape({
    title: PropTypes.string,
    info: PropTypes.string,
    luaApi: PropTypes.object,
  }).isRequired,

};



export default PickStoryLocal;
