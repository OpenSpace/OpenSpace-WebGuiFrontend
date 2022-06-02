import PropTypes from 'prop-types';
import React,{ Component } from 'react';
import HomeButtonContainer from '../TouchBar/UtilitiesMenu/containers/HomeButtonContainer';
import styles from './exploreClimate.scss';

import { connect } from 'react-redux';
import NextPrevStepButton from './NextPrevButton';
import PickStoryLocal from './LocalStory/PickStoryLocal';
import SightsController from '../TouchBar/UtilitiesMenu/presentational/SightsController';
import subStateToProps from "../../utils/subStateToProps";
import {
  storyGetLayer,
} from '../../utils/storyHelpers';
class ExploreClimate extends Component{

  constructor(props) {
    super(props);

    this.state = {
      StoryStep: 0,
      LocalStory: "default",
      showStory: true,
      currentStory: "default"
    };
    this.stepThroughStory = this.stepThroughStory.bind(this);
    this.Increment = this.Increment.bind(this);
    this.Decrement = this.Decrement.bind(this);
    this.def = this.def.bind(this);
  }

  Increment = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep + 1,
          showStory: true,
            currentStory: "default"
    }));
  }
  Decrement = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep - 1,
          showStory: true,
          currentStory: "default"
    }));
  }

  def(index, length){

    for (var i = 0 ; i <=  length; i++){
      if(i!=index){
        console.log("hhf " + this.state.LocalStory)
        this.setState((prevState) => ({
          LocalStory: this.state.DefLocalStory

        }));
      }

    }

  }


  stepThroughStory(StoryStep, filePath){
    const {luaApi, json } = this.props;
    return(
      filePath.map((story) => {
        if(story.id == StoryStep){

          storyGetLayer(luaApi, story.toggleboolproperties);
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
      );
    }


  render() {
    const { json, story, storyInfo} = this.props;
    const { StoryStep, showStory, LocalStory, currentStory } = this.state;
    var stepThroughJourney = this.stepThroughStory(StoryStep, json.journey);

    return (
      <div className={styles.StoryPosistion}>
        <div className = {styles.TellStory}>
          <div className = "flex">

            { StoryStep <  stepThroughJourney.length && showStory &&
              <div id = "je" >
                {stepThroughJourney}
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
              </div>
            }
              { StoryStep <  stepThroughJourney.length -1 &&
                <div>
                  <section className = {styles.NextStepButton}>
                    <NextPrevStepButton
                      next = {this.Increment}
                      storyStep = {StoryStep}
                      string = {"Next!"}
                      />
                  </section>
                </div>
              }
              {StoryStep > 0   &&
                <section className = {styles.PrevStepButton}>
                  <NextPrevStepButton
                    next = {this.Decrement}
                    storyStep = {StoryStep}
                    currentStory = { currentStory }
                    string = {"Previus!"}
                    />
                </section>
              }
              { json.journey[StoryStep].local.length > 0 &&
                  json.journey[StoryStep].local.map((story, index) => {
                    console.log("indec" + json.journey[StoryStep].local.length)

                    return(
                        <div key = {index}>
                        <PickStoryLocal key = { index }

                          storyIndex = {index}
                          storyInfo = { story }
                          StoryStep = { StoryStep }
                          def = {this.def}
                          currentStory = { currentStory }
                          setCurrentStory = {(newState) => this.setState({
                            currentStory: newState
                          })}
                          setShowStory = {(newState) => this.setState({
                            showStory: newState
                          })}
                        />
                       </div>
                      );
                    })
              }

          </div>
        </div>

        <section className={styles.HomeButton}>
          <HomeButtonContainer resetStory={this.props.resetStory}/>
        </section>
      </div>

      );

  }
}

ExploreClimate.propTypes = {
  story: PropTypes.objectOf(PropTypes.shape({
    storyTitle: PropTypes.string,
    storyInfo: PropTypes.string,
  })),
  luaApi: PropTypes.object,
};
ExploreClimate.defaultProps = {
  story: {},
  json: {},
};
const mapSubStateToProps = ({ luaApi }) => {
  return {
    luaApi: luaApi,
  };
};

const mapStateToSubState = (state) => ({
  luaApi: state.luaApi,
});
ExploreClimate = connect(subStateToProps(mapSubStateToProps, mapStateToSubState))(ExploreClimate);

export default ExploreClimate;
