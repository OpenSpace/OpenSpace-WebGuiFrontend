import PropTypes from 'prop-types';
import React,{ Component } from 'react';
import HomeButtonContainer from '../TouchBar/UtilitiesMenu/containers/HomeButtonContainer';
import styles from './exploreClimate.scss';
import stylesButton from '../Climate/Button.scss';
import Icon from '../common/MaterialIcon/MaterialIcon';
import { connect } from 'react-redux';
import NextPrevStepButton from './NextPrevButton';
import PickStoryLocal from './LocalStory/PickStoryLocal';
import SightsController from '../TouchBar/UtilitiesMenu/presentational/SightsController';
import subStateToProps from "../../utils/subStateToProps";
import {
  storyGetLayer, storyGetLocation
} from '../../utils/storyHelpers';
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

  stepThroughStory(StoryStep, filePath){
    const {luaApi, json } = this.props;
    return(
      filePath.map((story) => {
        if(story.id == StoryStep){
          storyGetLayer(luaApi, story.toggleboolproperties_noshow);
          storyGetLayer(luaApi, story.toggleboolproperties);
          storyGetLocation(luaApi, story.pos);

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
      luaApi.setPropertyValue("NavigationHandler.OrbitalNavigator.IdleBehavior.ApplyIdleBehavior", true);
    }


  render() {
    const { json, storyInfo, currentStory} = this.props;
    const { StoryStep, showStory, currentStoryLocal } = this.state;
    var stepThroughJourney = this.stepThroughStory(StoryStep, json.journey);
    console.log("local "  + json.journey[StoryStep].local.length)
    console.log("cirre " + currentStory)

    return (
      <div className={styles.StoryPosistion}>
        <div className = {styles.TellStory}>
          <div className = "flex">



            { StoryStep <  stepThroughJourney.length && showStory && (currentStory != "noShow") &&
              <div >
                {stepThroughJourney}
              </div>
            }
            { json.journey[StoryStep].local.length > 0 && (currentStory != "noShow") &&
                json.journey[StoryStep].local.map((story, index) => {
                  console.log("indec" + json.journey[StoryStep].local.length)

                  return(
                      <div key = {index}>
                      <PickStoryLocal key = { index }
                        storyInfo = { story }
                        currentStory = { currentStoryLocal }
                        setCurrentStory = {(newState) => this.setState({
                          currentStoryLocal: newState
                        })}
                        setShowStory = {(newState) => this.setState({
                          showStory: newState
                        })}
                      />
                     </div>
                    );
                  })
            }
            { StoryStep <  stepThroughJourney.length -1 && (currentStory != "noShow")&&
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
            {(currentStory != "noShow") &&

              <div className={styles.HomeButton}>
                  <HomeButtonContainer resetStory={this.props.resetStory}/>
              </div>
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
