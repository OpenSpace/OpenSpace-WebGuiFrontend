import PropTypes from 'prop-types';
import React,{ Component } from 'react';
import HomeButtonContainer from '../TouchBar/UtilitiesMenu/containers/HomeButtonContainer';
import styles from './exploreClimate.scss';
import InfoMenu from './infoMenu'
import { connect } from 'react-redux';
import NextStepButton from './nextButton';
import SightsController from '../TouchBar/UtilitiesMenu/presentational/SightsController';

import {
  storyGetLayer,
} from '../../utils/storyHelpers';
class exploreClimate extends Component{

  constructor(props) {
    super(props);

    this.state = {
      StoryStep: 0,
    };

    this.setLayer = this.setLayer.bind(this);
    this.stepThroughStory = this.stepThroughStory.bind(this);
    this.Increment = this.Increment.bind(this);

  }

  setLayer(layer){

    const{luaApi} = this.props;
    const layerFromJson = storyGetLayer(luaApi, layer);

    return layerFromJson;
  }

  Increment = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep + 1
    }));
  }

  stepThroughStory(StoryStep){
    const { json } = this.props;

    return(
      json.journey.map((story) => {
        if(story.id == StoryStep){
          return (
            <div key = {story.id}>
              <h1>
                {story.title}
              </h1>
              <p>
                {story.storyinfo}
              </p>
            </div>
          );
        }
      })
    )
  }


  render() {
    //console.log("hej")
    //console.table(this.props.currentStory)
    //console.log(story.sightscontroller)
    const { json, story, storyInfo} = this.props;
    const { StoryStep } = this.state;

    var stepThroughStory = this.stepThroughStory(StoryStep);


    //console.log(this.props.currentStory)
    //console.log("nemen")
    //console.table(this.props.story.title)
    //console.log("wooddffffp")
    //console.log(StoryStep)
    return (

      <div className={styles.StoryPosistion}>

        <div key = {story.id} className = {styles.TellStory}>
          <div className = "flex">

              {stepThroughStory}

              <br/>
              <br/>
              <br/>
              <br/>
              <br/>

              <section className = {styles.NextStepButton}>
                <NextStepButton increment = {this.Increment} storyStep = {StoryStep}/>
              </section>

          </div>
        </div>
        <section className={styles.HomeButton}>
          <HomeButtonContainer resetStory={this.props.resetStory}/>
        </section>
      </div>

    );
  }
}



exploreClimate.propTypes = {
  story: PropTypes.objectOf(PropTypes.shape({
    storyTitle: PropTypes.string,
    storyInfo: PropTypes.string,
  })),
};
exploreClimate.defaultProps = {
  story: {},
  json: {},
};

export default exploreClimate;
