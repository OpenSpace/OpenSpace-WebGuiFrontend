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
  storyGetLayer, storyGetLocation, storyGetIdleBehavior, storyResetLayer
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
    var orbitAtConstantLatiude = 1
    storyResetLayer(luaApi);
    return(
      filePath.map((story) => {
        if(story.id == StoryStep){

          story.toggleboolproperties.map((layer) => {
          //  console.log("Layer!!!!!");
          //  console.table(layer);
              storyGetLayer(luaApi, layer )
          });
        /*  if (story.local.length > 0){
            story.local.toggleboolproperties.map((layer) => {
              console.table(layer);
                storyGetLayer(luaApi, layer )
            });
          }*/

          //console.log("TITLE not local??: " + story.title)
          //console.log("start local")
          //console.table(story.local)
          //console.log("end local")
          storyGetLocation(luaApi, story.pos);
          storyGetIdleBehavior(luaApi, 1);

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
    return (
      <div className={styles.StoryPosistion}>
        <div className = {styles.TellStory}>
          <div className = "flex">
            { StoryStep <  stepThroughJourney.length && showStory && (currentStory != "noShow") &&
              <div >
                {stepThroughJourney}
              </div>
            }

            <br/>
            <br/>
            <br/>

              { json.journey[StoryStep].local.length > 0 && (currentStory != "noShow") &&
                  json.journey[StoryStep].local.map((story, index) => {

                    //console.log("LOCAL TITLE: " + story.title)
                    //console.log("LOCAL LAYER: " + story.toggleboolproperties)
                    //console.log("LOCAL LAYER")
                    //console.table(story.toggleboolproperties)
                    /*story.toggleboolproperties.map((layer) => {
                      console.log("Layer LOCAL starts ");
                      console.table(layer);
                      console.log("Layer LOCAL ends ");
                      storyGetLayer(luaApi, layer )
                    });*/

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
