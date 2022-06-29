import PropTypes from 'prop-types';
import React, { Component, useState } from 'react';
import styles from './exploreClimate.scss';
import stylesButton from '../Climate/Button.scss';
import Icon from '../common/MaterialIcon/MaterialIcon';
import { connect } from 'react-redux';
import NextPrevStepButton from './NextPrevButton';
import PickStoryLocal from './LocalStory/PickStoryLocal';
import SightsController from '../TouchBar/UtilitiesMenu/presentational/SightsController';
import subStateToProps from "../../utils/subStateToProps";
import {
  storyGetLayer, storyGetLocation, storyGetIdleBehavior, storyResetLayer, storyGetScreenSpace
} from '../../utils/storyHelpers';
import { setDate, togglePause } from '../../utils/timeHelpers';
import TimePlayerClimate from '../Climate/TimePlayerClimate';
import NewStoryButton from './resetStoryButton';

//import { setDate } from '../../utils/timeHelpers';
class ExploreClimate extends Component{

  constructor(props) {
    super(props);
    this.state = {
      StoryStep: 0,
      showStory: true,
      currentStory: "default",
      currentStoryLocal: "default",
      showMore : false
    };
    this.stepThroughStory = this.stepThroughStory.bind(this);
    this.NextStep = this.NextStep.bind(this);
    this.PrevStep = this.PrevStep.bind(this);

    //this.getToggleboolproperties =this.getToggleboolproperties.bind(this);

  }
  NextStep = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep + 1,
          showStory: true,
          currentStory: "default",
          currentStoryLocal: "default",
          showMore: true
    }));
  }
  PrevStep = () => {
    {this.state.currentStoryLocal == "default" &&
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep - 1,
          showStory: true,
          currentStory: "default",
          currentStoryLocal: "default"
        }));
    }
    {this.state.currentStoryLocal != "default" &&
      this.setState((prevState) => ({
        showStory: true,
        currentStory: "default",
        currentStoryLocal: "default"
      }));
    }
  }


  stepThroughStory(StoryStep, filePath, storyLocal){
    const {luaApi, json, currentStoryLocal } = this.props;
    const {showMore} = this.state;
    var orbitAtConstantLatiude = 1 //placment in IdleBehavior scrollbar

    storyResetLayer(luaApi);

    return(
      filePath.map((story) => {
        if(story.id == StoryStep){

            if (storyLocal == "default"){

                story.toggleboolproperties.map((layer) => {
                    storyGetLayer(luaApi, layer )
                });
                togglePause(luaApi);
                storyGetLocation(luaApi, story.pos, story.date);
                storyGetIdleBehavior(luaApi, orbitAtConstantLatiude, true);
                togglePause(luaApi);
                //storyGetScreenSpace(luaApi, story.screenSpace)
            }

        return (
            <div key = {story.id} >


              <h1>
                {story.title} <button onClick={()=> this.setState({showMore: !showMore })}>
                  {showMore ?   <Icon icon= {"expand_more"}/> : <Icon icon= {"expand_less"}/>}

                </button>
              </h1>

              <div>
                {!showMore  && <p> {story.storyinfo.split('\n', 1)[0]}</p>}
                  {showMore && <p>{story.storyinfo}</p>}
                </div>
                {story.timeSpeed != 0 &&
                <TimePlayerClimate timeSpeedController = {story.timeSpeed}/>
                }

            </div>
            );
          }
        })
      );
    }

  render() {
    const { json, storyInfo, currentStory, luaApi, resetStory } = this.props;
    const { StoryStep, showStory, currentStoryLocal } = this.state;



      var stepThroughJourney = this.stepThroughStory(StoryStep, json.journey, currentStoryLocal);



    //var getToggleboolproperties = this.getToggleboolproperties(StoryStep, json.journey)
    //noSow -> we don't want to show the story if pressing the climate icon in the bar
    // see ClimatePanel
    return (
      <div className={styles.StoryPosistion}>
        <div className = {styles.TellStory}>

            { StoryStep <  stepThroughJourney.length && showStory && (currentStory != "noShow") &&
              <div  className = {styles.frameBorder}>
                {stepThroughJourney}
              </div>
            }

            <br/>
            <br/>
            <br/>

              { json.journey[StoryStep].local.length > 0 && (currentStory != "noShow") &&
                  json.journey[StoryStep].local.map((story, index) => {
                    return(
                        <div key = {index} >
                        <PickStoryLocal key = { index }
                          storyInfo = { story }
                          currentStory = { currentStoryLocal }
                          setCurrentStory = {(newState) => this.setState({
                            currentStoryLocal: newState
                          })}
                          setShowStory = {(newState) => this.setState({
                            showStory: newState
                          })}
                          luaApi = {luaApi}

                        />
                       </div>
                      );
                    })
                }
                <br/>
                <br/>
                <br/>

                { StoryStep <  stepThroughJourney.length -1 && (currentStory != "noShow") &&
                    <div>
                      <section className = {styles.NextStepButton}>
                        <NextPrevStepButton
                          next = {this.NextStep}
                          storyStep = {StoryStep}
                          string = {"Next"}
                          iconNextPrev = "chevron_right"
                          iconPlacement = {styles.Icon}
                          />
                      </section>
                    </div>
                  }
                  {StoryStep > 0  && (currentStory != "noShow")  &&
                    <section className = {styles.PrevStepButton}>
                      <NextPrevStepButton
                        next = {this.PrevStep}
                        storyStep = {StoryStep}
                        currentStory = { currentStory }
                        string = {"Previous"}
                        iconNextPrev = "chevron_left"
                        iconPlacement = {styles.Icon}
                        />
                    </section>
                  }


                  { StoryStep ==  stepThroughJourney.length-1   && (currentStory != "noShow") &&
                    <section   className = {styles.NextStepButton} >
                      <NewStoryButton resetStory = {resetStory}/>
                    </section>
                  }

        </div>
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
  currentStory: PropTypes.string.isRequired,
  showTimeController: PropTypes.bool.isRequired
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
