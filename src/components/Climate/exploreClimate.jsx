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
  storyGetLayer, storyGetLayer2, storyGetLocation
} from '../../utils/storyHelpers';
class ExploreClimate extends Component{

  constructor(props) {
    super(props);

    this.state = {
      StoryStep: 0,
      LocalStory: "default",
      showStory: true,
    };
    this.stepThroughStory = this.stepThroughStory.bind(this);
    this.Increment = this.Increment.bind(this);
    this.Decrement = this.Decrement.bind(this);
  }

  Increment = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep + 1,
          showStory: true
    }));
  }
  Decrement = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep - 1,
          showStory: true
    }));
  }

  ShowMainStory = () =>{}


  stepThroughStory(StoryStep, filePath){
    const {luaApi, json } = this.props;
    return(
      filePath.map((story) => {
        if(story.id == StoryStep){
          storyGetLayer2(luaApi, story.toggleboolproperties_noshow);
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
    }


  render() {
    const { json, story, storyInfo} = this.props;
    const { StoryStep, showStory } = this.state;
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
                      string = {"Next"}
                      iconNextPrev = "chevron_right"
                      iconPlacement = {styles.Icon}
                      />

                  </section>
                </div>
              }

              {StoryStep > 0   &&
                <section className = {styles.PrevStepButton}>
                  <NextPrevStepButton
                    next = {this.Decrement}
                    storyStep = {StoryStep}
                    string = {"Previus"}
                    iconNextPrev = "chevron_left"
                    iconPlacement = {styles.Icon}
                    />

                </section>
              }
              { json.journey[StoryStep].local.length > 0 &&
                  json.journey[StoryStep].local.map((story, index) => {
                    console.log("indec" + index)
                    return(
                        <div key = {index}>
                        <PickStoryLocal key = { index }
                          storyIndex = {index}
                          storyInfo = { story }
                          StoryStep = { StoryStep }
                          setShowStory = {(newState) => this.setState({
                            showStory: newState
                          })}
                        />
                       </div>
                      );
                    })
              }

              <br/>
              <br/>
              <br/>
              <div className={styles.HomeButton}>

                  <HomeButtonContainer resetStory={this.props.resetStory}/>


              </div>

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
