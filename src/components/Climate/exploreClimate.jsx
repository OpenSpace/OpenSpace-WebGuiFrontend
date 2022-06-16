import PropTypes from 'prop-types';
import React,{ Component } from 'react';
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
//import { setDate } from '../../utils/timeHelpers';
class ExploreClimate extends Component{
  constructor(props) {
    super(props);
    this.state = {
      StoryStep: 0,
      showStory: true,
      currentStory: "default",
      currentStoryLocal: "default"
    };
    this.stepThroughStory = this.stepThroughStory.bind(this);
    this.Increment = this.Increment.bind(this);
    this.Decrement = this.Decrement.bind(this);

    //this.getToggleboolproperties =this.getToggleboolproperties.bind(this);

  }
  Increment = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep + 1,
          showStory: true,
          currentStory: "default",
          currentStoryLocal: "default"
    }));
  }
  Decrement = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep - 1,
          showStory: true,
          currentStory: "default",
          currentStoryLocal: "default"
    }));
  }

  stepThroughStory(StoryStep, filePath){
    const {luaApi, json } = this.props;
    var orbitAtConstantLatiude = 1 //placment in IdleBehavior scrollbar

    storyResetLayer(luaApi);

    return(
      filePath.map((story) => {
        if(story.id == StoryStep){
          story.toggleboolproperties.map((layer) => {
          //  console.log("Layer!!!!!");
          //  console.table(layer);
              storyGetLayer(luaApi, layer )
          });
          console.log(story.date)

          storyGetLocation(luaApi, story.pos, story.date);
          storyGetIdleBehavior(luaApi, orbitAtConstantLatiude, true);
          //storyGetScreenSpace(luaApi, story.screenSpace)




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
    const { json, storyInfo, currentStory, luaApi } = this.props;
    const { StoryStep, showStory, currentStoryLocal } = this.state;
    var stepThroughJourney = this.stepThroughStory(StoryStep, json.journey);

    //var getToggleboolproperties = this.getToggleboolproperties(StoryStep, json.journey)
    //noSow -> we don't want to show the story if pressing the climate icon in the bar
    // see ClimatePanel
    return (
      <div className={styles.StoryPosistion}>
        <div className = {styles.TellStory}>
          <div className = "flex">
            { StoryStep <  stepThroughJourney.length && showStory && (currentStory != "noShow") &&
              <div  >
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
                          next = {this.Increment}
                          storyStep = {StoryStep}
                          string = {"Next"}
                          iconNextPrev = "chevron_right"
                          iconPlacement = {styles.Icon}
                          />
                      </section>
                    </div>
                  }
                  {StoryStep > 0  && (currentStory != "noShow") &&
                    <section className = {styles.PrevStepButton}>
                      <NextPrevStepButton
                        next = {this.Decrement}
                        storyStep = {StoryStep}
                        currentStory = { currentStory }
                        string = {"Previus"}
                        iconNextPrev = "chevron_left"
                        iconPlacement = {styles.Icon}
                        />
                    </section>
                  }
          </div>
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
  currentStory: PropTypes.string.isRequired
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
